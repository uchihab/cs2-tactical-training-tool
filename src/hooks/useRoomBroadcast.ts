"use client";

import { useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RoundPhase, RoundStatus } from "@/types";

/**
 * Eventos de round obrigatórios desta etapa. Comandos táticos futuros
 * (EXEC_A, EXEC_B, HOLD, FAKE, ROTATE, CANCEL, GO) devem ser adicionados aqui
 * como novos membros de `RoundBroadcastMessage` (cada um com seu próprio
 * payload dedicado), reaproveitando o mesmo canal `room:<roomId>` — sem
 * alterar os 4 eventos de round abaixo. Não implementados nesta etapa.
 */
export type RoundBroadcastEventName = "ROUND_START" | "ROUND_PAUSE" | "ROUND_RESUME" | "ROUND_RESET";

export interface RoundStartPayload {
  roundId: string;
  startedAt: string;
  timeRemaining: number;
  phase: RoundPhase;
  status: RoundStatus;
  sentAt: number;
}

export interface RoundPausePayload {
  roundId: string;
  timeRemaining: number;
  status: RoundStatus;
  sentAt: number;
}

export interface RoundResumePayload {
  roundId: string;
  startedAt: string;
  timeRemaining: number;
  status: RoundStatus;
  sentAt: number;
}

export interface RoundResetPayload {
  roundId: string;
  timeRemaining: number;
  phase: RoundPhase;
  status: RoundStatus;
  sentAt: number;
}

export type RoundBroadcastMessage =
  | { event: "ROUND_START"; payload: RoundStartPayload }
  | { event: "ROUND_PAUSE"; payload: RoundPausePayload }
  | { event: "ROUND_RESUME"; payload: RoundResumePayload }
  | { event: "ROUND_RESET"; payload: RoundResetPayload };

/** Mesma forma de `RoundBroadcastMessage`, mas sem `sentAt` — preenchido no envio. */
export type RoundBroadcastInput =
  | { event: "ROUND_START"; payload: Omit<RoundStartPayload, "sentAt"> }
  | { event: "ROUND_PAUSE"; payload: Omit<RoundPausePayload, "sentAt"> }
  | { event: "ROUND_RESUME"; payload: Omit<RoundResumePayload, "sentAt"> }
  | { event: "ROUND_RESET"; payload: Omit<RoundResetPayload, "sentAt"> };

type SupabaseChannel = ReturnType<ReturnType<typeof createClient>["channel"]>;

const BROADCAST_EVENT_NAME = "round-command";

interface UseRoomBroadcastOptions {
  /** Chamado quando um comando de outro dispositivo chega pelo canal. */
  onReceive?: (message: RoundBroadcastMessage) => void;
}

export interface UseRoomBroadcastResult {
  /** Envia um comando de round a todos os outros dispositivos na mesma sala. */
  sendCommand: (input: RoundBroadcastInput) => void;
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

    channel.on<RoundBroadcastMessage["payload"]>(
      "broadcast",
      { event: BROADCAST_EVENT_NAME },
      ({ payload: message }) => {
        const receivedAt = Date.now();
        const typedMessage = message as unknown as RoundBroadcastMessage;

        console.log("BROADCAST_RECEIVE", {
          event: typedMessage.event,
          roomId,
          sentAt: typedMessage.payload.sentAt,
          receivedAt,
        });
        console.log("BROADCAST_LATENCY", receivedAt - typedMessage.payload.sentAt, "ms");

        onReceiveRef.current?.(typedMessage);
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
    (input: RoundBroadcastInput) => {
      const channel = channelRef.current;
      if (!channel || !roomId || !readyRef.current) return;

      const sentAt = Date.now();
      console.log("BROADCAST_SEND", { event: input.event, roomId, sentAt });

      const message: RoundBroadcastMessage = {
        event: input.event,
        payload: { ...input.payload, sentAt },
      } as RoundBroadcastMessage;

      channel.send({
        type: "broadcast",
        event: BROADCAST_EVENT_NAME,
        payload: message,
      });
    },
    [roomId],
  );

  return { sendCommand };
}
