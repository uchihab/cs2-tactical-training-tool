"use client";

import { useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RoundRecord } from "@/types";

export type RoundBroadcastEventName = "START" | "PAUSE" | "RESUME" | "RESET";

export interface RoundBroadcastPayload {
  event: RoundBroadcastEventName;
  roomId: string;
  sentAt: number;
  round: RoundRecord;
}

type SupabaseChannel = ReturnType<ReturnType<typeof createClient>["channel"]>;

const BROADCAST_EVENT_NAME = "round-command";

interface UseRoomBroadcastOptions {
  /** Chamado quando um comando de outro dispositivo chega pelo canal. */
  onReceive?: (payload: RoundBroadcastPayload) => void;
}

export interface UseRoomBroadcastResult {
  /** Envia um comando de round a todos os outros dispositivos na mesma sala. */
  sendCommand: (event: RoundBroadcastEventName, round: RoundRecord) => void;
}

/**
 * Canal de Supabase Realtime Broadcast (`room:<roomId>`), usado para propagar
 * comandos de round quase instantaneamente entre dispositivos, em paralelo
 * com a gravação no banco — postgres_changes (em useRoundState) continua
 * sendo a fonte de verdade e reconcilia logo em seguida.
 *
 * O Broadcast, por padrão, NÃO ecoa a própria mensagem de volta para quem a
 * enviou (`config.broadcast.self` é `false`), então o IGL pode entrar neste
 * mesmo canal (para futura simetria/depuração) sem nunca reaplicar o próprio
 * comando uma segunda vez.
 */
export function useRoomBroadcast(
  roomId: string | null,
  { onReceive }: UseRoomBroadcastOptions = {},
): UseRoomBroadcastResult {
  const channelRef = useRef<SupabaseChannel | null>(null);
  const readyRef = useRef(false);
  const onReceiveRef = useRef(onReceive);

  useEffect(() => {
    onReceiveRef.current = onReceive;
  }, [onReceive]);

  useEffect(() => {
    if (!roomId) return;

    const supabase = createClient();
    const channel = supabase.channel(`room:${roomId}`);

    channel.on<RoundBroadcastPayload>(
      "broadcast",
      { event: BROADCAST_EVENT_NAME },
      ({ payload: message }) => {
        const receivedAt = Date.now();

        console.log("BROADCAST_RECEIVE", {
          event: message.event,
          roomId: message.roomId,
          sentAt: message.sentAt,
          receivedAt,
        });
        console.log("BROADCAST_LATENCY", receivedAt - message.sentAt, "ms");

        onReceiveRef.current?.(message);
      },
    );

    channel.subscribe((status) => {
      readyRef.current = status === "SUBSCRIBED";
    });

    channelRef.current = channel;

    return () => {
      readyRef.current = false;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const sendCommand = useCallback(
    (event: RoundBroadcastEventName, round: RoundRecord) => {
      const channel = channelRef.current;
      if (!channel || !roomId || !readyRef.current) return;

      const sentAt = Date.now();
      console.log("BROADCAST_SEND", { event, roomId, sentAt });

      channel.send({
        type: "broadcast",
        event: BROADCAST_EVENT_NAME,
        payload: { event, roomId, sentAt, round } satisfies RoundBroadcastPayload,
      });
    },
    [roomId],
  );

  return { sendCommand };
}
