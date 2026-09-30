"use client";

import { useMemo } from "react";
import { useRoundState } from "./useRoundState";
import { useRoomBroadcast, type RoundBroadcastMessage } from "./useRoomBroadcast";
import { ROUND_DURATION_SECONDS, getPhaseForTime } from "@/lib/constants/round-phases";
import type { RoundPhaseInfo, RoundRecord, RoundStatus } from "@/types";

/**
 * Aplica um comando recebido por Broadcast sobre o round conhecido
 * localmente. O payload do Broadcast é intencionalmente enxuto (só os campos
 * que aquele comando muda — ver useRoomBroadcast), então isto é sempre um
 * merge sobre o último round conhecido, nunca uma substituição completa.
 * Sem round local ainda (ex: broadcast chegou antes da busca inicial), a
 * mensagem é ignorada — a busca inicial e o postgres_changes cobrem o caso.
 */
function applyBroadcastToRound(
  round: RoundRecord | null,
  message: RoundBroadcastMessage,
): RoundRecord | null {
  if (!round) return round;

  switch (message.event) {
    case "ROUND_START":
      return {
        ...round,
        status: message.payload.status,
        started_at: message.payload.startedAt,
        paused_at: null,
        finished_at: null,
        time_remaining: message.payload.timeRemaining,
        current_phase: message.payload.phase,
      };
    case "ROUND_PAUSE":
      return {
        ...round,
        status: message.payload.status,
        time_remaining: message.payload.timeRemaining,
      };
    case "ROUND_RESUME":
      return {
        ...round,
        status: message.payload.status,
        started_at: message.payload.startedAt,
        paused_at: null,
        time_remaining: message.payload.timeRemaining,
      };
    case "ROUND_RESET":
      return {
        ...round,
        status: message.payload.status,
        started_at: null,
        paused_at: null,
        finished_at: null,
        time_remaining: message.payload.timeRemaining,
        current_phase: message.payload.phase,
      };
    default:
      return round;
  }
}

export interface UseRemoteRoundResult {
  round: RoundRecord | null;
  loading: boolean;
  error: string | null;
  timeRemaining: number;
  status: RoundStatus;
  phase: RoundPhaseInfo;
}

/** Tempo restante calculado localmente a partir do round, sem depender de ticks gravados no banco. */
export function computeTimeRemaining(round: RoundRecord, now: number): number {
  if (round.status === "RUNNING" && round.started_at) {
    const startedAtMs = new Date(round.started_at).getTime();
    const elapsedSeconds = (now - startedAtMs) / 1000;
    return Math.max(0, Math.min(ROUND_DURATION_SECONDS, ROUND_DURATION_SECONDS - elapsedSeconds));
  }

  return round.time_remaining;
}

/**
 * Lê (e mantém sincronizado via Realtime) o round de uma sala. Uso somente
 * leitura — não grava nada no banco. Compartilhado por todas as telas,
 * incluindo o IGL (que soma controles por cima via useIglRoundController).
 */
export function useRemoteRound(roomId: string | null): UseRemoteRoundResult {
  const { round, setRound, loading, error, now } = useRoundState(roomId);

  // Aplica comandos do IGL na hora (Broadcast), sem esperar o eco do
  // postgres_changes — que ainda chega logo depois e reconcilia com o dado
  // definitivo do banco (ex: started_at exato gravado no servidor).
  useRoomBroadcast(roomId, {
    onReceive: (message) => setRound(applyBroadcastToRound(round, message)),
  });

  // Sem sala selecionada, não há round: reporta o estado de repouso sem
  // depender de um efeito só para "resetar" estado.
  const effectiveRound = roomId ? round : null;

  const timeRemaining = useMemo(
    () => (effectiveRound ? computeTimeRemaining(effectiveRound, now) : ROUND_DURATION_SECONDS),
    [effectiveRound, now],
  );

  const phase = useMemo(() => getPhaseForTime(timeRemaining), [timeRemaining]);
  const status: RoundStatus = effectiveRound?.status ?? "IDLE";

  return {
    round: effectiveRound,
    loading: roomId ? loading : false,
    error: roomId ? error : null,
    timeRemaining,
    status,
    phase,
  };
}
