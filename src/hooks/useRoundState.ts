"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveRound } from "@/lib/supabase/rounds";
import type { RoundRecord } from "@/types";

export interface UseRoundStateResult {
  round: RoundRecord | null;
  /** Sobrescreve o round local imediatamente (usado para Optimistic UI). */
  setRound: (round: RoundRecord | null) => void;
  loading: boolean;
  error: string | null;
  /**
   * Instante usado para calcular o tempo decorrido. É realinhado com
   * Date.now() sempre que `round` muda (otimista ou Realtime) e a cada tick
   * de 1s enquanto RUNNING — nunca fica "parado" de uma pausa anterior.
   */
  now: number;
}

const RELEVANT_FIELDS = [
  "status",
  "started_at",
  "paused_at",
  "finished_at",
  "time_remaining",
  "current_phase",
] as const satisfies readonly (keyof RoundRecord)[];

/** Só considera "diferente" quando algum campo que afeta a exibição realmente muda. */
function hasRelevantDiff(a: RoundRecord | null, b: RoundRecord | null): boolean {
  if (a === b) return false;
  if (!a || !b) return true;
  return RELEVANT_FIELDS.some((field) => a[field] !== b[field]);
}

/**
 * Estado base do round de uma sala: busca inicial + assinatura Realtime,
 * com um `setRound` exposto para permitir escrita otimista local (usado por
 * useIglRoundController). Leitores puros usam useRemoteRound por cima disto.
 *
 * Também é o único lugar que possui o "relógio" (`now`): centralizar aqui
 * evita que cada hook consumidor mantenha seu próprio `now`, potencialmente
 * desatualizado no instante exato em que `round` muda (foi isso que causava
 * o flash para 115s ao dar RESUME — ver useIglRoundController).
 */
export function useRoundState(roomId: string | null): UseRoundStateResult {
  const [round, setRoundState] = useState<RoundRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const roundRef = useRef<RoundRecord | null>(null);

  const setRound = useCallback((next: RoundRecord | null) => {
    roundRef.current = next;
    setRoundState(next);
    // Realinha "now" no mesmo instante em que o round muda, para que o
    // primeiro render após START/RESUME (ou um eco do Realtime) já calcule
    // o tempo restante a partir de um `now` fresco — nunca de um valor
    // parado de antes de uma pausa.
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!roomId) return;

    let active = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const initialRound = await getActiveRound(roomId);
        if (!active) return;
        setRound(initialRound);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar o round.");
      } finally {
        if (active) setLoading(false);
      }

      if (!active) return;

      // Só assina o Realtime depois de ter o estado inicial em mãos.
      channel = supabase
        .channel(`rounds-room-${roomId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "rounds", filter: `room_id=eq.${roomId}` },
          (payload) => {
            if (!active) return;
            const incoming = payload.new as RoundRecord;
            // Evita saltos visuais: ignora o eco de uma escrita já reconciliada
            // (nossa própria otimista/confirmada) quando não muda nada relevante.
            if (hasRelevantDiff(roundRef.current, incoming)) {
              setRound(incoming);
            }
          },
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [roomId, setRound]);

  // Mantém "now" avançando a cada segundo enquanto o round está RUNNING.
  useEffect(() => {
    if (round?.status !== "RUNNING") return;

    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [round?.status]);

  return { round, setRound, loading, error, now };
}
