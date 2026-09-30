"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoundState } from "./useRoundState";
import { computeTimeRemaining } from "./useRemoteRound";
import { useRoomBroadcast, type RoundBroadcastInput } from "./useRoomBroadcast";
import {
  finishRemoteRound,
  getActiveRound,
  pauseRemoteRound,
  resetRemoteRound,
  resumeRemoteRound,
  startRemoteRound,
  updateRoundPhase,
} from "@/lib/supabase/rounds";
import { ROUND_DURATION_SECONDS, getPhaseForTime } from "@/lib/constants/round-phases";
import type { RoundPhaseInfo, RoundRecord, RoundStatus } from "@/types";

export interface UseIglRoundControllerResult {
  round: RoundRecord | null;
  loading: boolean;
  error: string | null;
  timeRemaining: number;
  status: RoundStatus;
  phase: RoundPhaseInfo;
  /** Mensagem discreta de "estado restaurado" após falha de sincronização. */
  syncMessage: string | null;
  isPending: boolean;
  startRound: () => void;
  pauseRound: () => void;
  resumeRound: () => void;
  resetRound: () => void;
}

const SYNC_FAILURE_MESSAGE = "Falha ao sincronizar. Estado restaurado.";

type CommandName = "ROUND_START" | "ROUND_PAUSE" | "ROUND_RESUME" | "ROUND_RESET";

/**
 * Round remoto com controles — uso exclusivo da tela do IGL. Os 4 comandos
 * aplicam Optimistic UI: o estado local muda na hora do clique, a chamada ao
 * Supabase roda em background, e o resultado (ou uma falha, com rollback via
 * getActiveRound) reconcilia o estado depois — sem nunca bloquear o clique
 * num `await`.
 *
 * Este também é o único lugar da aplicação que grava mudança de fase e o fim
 * do round: as outras telas usam useRemoteRound puro (somente leitura), então
 * nunca há dois dispositivos tentando escrever a mesma transição ao mesmo
 * tempo.
 */
export function useIglRoundController(roomId: string | null): UseIglRoundControllerResult {
  const { round, setRound, loading, error, now } = useRoundState(roomId);
  // Entra no mesmo canal `room:<roomId>` para poder ENVIAR comandos. Como o
  // Broadcast não ecoa a própria mensagem (config padrão `self: false`), o
  // IGL nunca reaplica o próprio evento — não precisa de `onReceive` aqui.
  const { sendCommand } = useRoomBroadcast(roomId);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const pendingCommandRef = useRef<CommandName | null>(null);
  const [isPending, setIsPending] = useState(false);

  const timeRemaining = useMemo(
    () => (round ? computeTimeRemaining(round, now) : ROUND_DURATION_SECONDS),
    [round, now],
  );

  const phase = useMemo(() => getPhaseForTime(timeRemaining), [timeRemaining]);
  const status: RoundStatus = round?.status ?? "IDLE";

  const lastKnownPhaseRef = useRef<string | null>(null);
  const finishRequestedAtRef = useRef<string | null>(null);

  // Mantém a referência sincronizada com a verdade do banco (inclui o eco
  // do Realtime das nossas próprias gravações), sem nunca gravar aqui.
  useEffect(() => {
    lastKnownPhaseRef.current = round?.current_phase ?? null;
  }, [round?.current_phase]);

  // Grava a fase somente quando ela muda — nunca a cada segundo.
  useEffect(() => {
    if (!round || status !== "RUNNING") return;
    if (phase.id === lastKnownPhaseRef.current) return;

    lastKnownPhaseRef.current = phase.id;
    updateRoundPhase(round.id, phase.id).catch((err) => {
      console.error("UPDATE ROUND PHASE ERROR", err);
    });
  }, [round, status, phase]);

  // Finaliza o round uma única vez por "sessão" de start/resume (chaveado
  // por started_at, que muda a cada novo start/resume).
  useEffect(() => {
    if (!round || status !== "RUNNING") return;
    if (timeRemaining > 0) return;
    if (finishRequestedAtRef.current === round.started_at) return;

    finishRequestedAtRef.current = round.started_at;
    finishRemoteRound(round.id).catch((err) => {
      console.error("FINISH REMOTE ROUND ERROR", err);
      finishRequestedAtRef.current = null;
    });
  }, [round, status, timeRemaining]);

  /**
   * Aplica o estado otimista imediatamente, dispara a chamada remota em
   * background e reconcilia (sucesso) ou restaura do banco (falha).
   * Nunca faz `await` antes da mudança visual.
   */
  const runCommand = useCallback(
    (
      name: CommandName,
      optimisticRound: RoundRecord,
      broadcastInput: RoundBroadcastInput,
      remoteCall: () => Promise<RoundRecord>,
    ) => {
      if (pendingCommandRef.current) return; // já existe um comando em voo: ignora o clique
      if (!roomId) return;

      pendingCommandRef.current = name;
      setIsPending(true);
      setSyncMessage(null);
      setRound(optimisticRound); // 1) Optimistic UI: resposta visual imediata (IGL)
      sendCommand(broadcastInput); // 2) Broadcast: propaga para as outras telas na hora

      const label = `${name}_REMOTE`;
      console.time(label);

      remoteCall() // 3) Persiste no Supabase em background (fonte de verdade)
        .then((confirmedRound) => {
          console.timeEnd(label);
          setRound(confirmedRound); // reconcilia com a verdade do banco (ex: started_at real)
        })
        .catch(async (err) => {
          console.timeEnd(label);
          console.error(`${name} REMOTE ERROR`, err);

          try {
            const restored = await getActiveRound(roomId);
            setRound(restored);
          } catch (refetchErr) {
            console.error("RESTORE ROUND AFTER FAILURE ERROR", refetchErr);
          }

          setSyncMessage(SYNC_FAILURE_MESSAGE);
        })
        .finally(() => {
          pendingCommandRef.current = null;
          setIsPending(false);
        });
    },
    [roomId, setRound, sendCommand],
  );

  const startRound = useCallback(() => {
    if (!round) return;

    const startedAtIso = new Date().toISOString();
    const optimistic: RoundRecord = {
      ...round,
      status: "RUNNING",
      started_at: startedAtIso,
      paused_at: null,
      finished_at: null,
      time_remaining: ROUND_DURATION_SECONDS,
      current_phase: "MOMENTO_1",
    };

    runCommand(
      "ROUND_START",
      optimistic,
      {
        event: "ROUND_START",
        payload: {
          roundId: round.id,
          startedAt: startedAtIso,
          timeRemaining: ROUND_DURATION_SECONDS,
          phase: "MOMENTO_1",
          status: "RUNNING",
        },
      },
      () => startRemoteRound(round.id),
    );
  }, [round, runCommand]);

  const pauseRound = useCallback(() => {
    if (!round) return;

    const frozenTimeRemaining = Math.max(0, Math.round(timeRemaining));
    const optimistic: RoundRecord = {
      ...round,
      status: "PAUSED",
      paused_at: new Date().toISOString(),
      time_remaining: frozenTimeRemaining,
    };

    runCommand(
      "ROUND_PAUSE",
      optimistic,
      {
        event: "ROUND_PAUSE",
        payload: { roundId: round.id, timeRemaining: frozenTimeRemaining, status: "PAUSED" },
      },
      () => pauseRemoteRound(round.id, timeRemaining),
    );
  }, [round, runCommand, timeRemaining]);

  const resumeRound = useCallback(() => {
    if (!round) return;

    // DIAGNÓSTICO TEMPORÁRIO — remover depois de confirmar que o flash para
    // 01:55 no RESUME não volta a acontecer.
    console.log("RESUME_BEFORE", {
      timeRemaining,
      status: round.status,
      startedAt: round.started_at,
    });

    const pausedTimeRemaining = timeRemaining;
    const elapsedAlready = ROUND_DURATION_SECONDS - pausedTimeRemaining;
    const optimisticStartedAt = new Date(Date.now() - elapsedAlready * 1000).toISOString();
    const optimistic: RoundRecord = {
      ...round,
      status: "RUNNING",
      started_at: optimisticStartedAt,
      paused_at: null,
      // time_remaining NÃO é tocado aqui: continua sendo o valor pausado até
      // o próximo cálculo (que usa started_at, não este campo, enquanto RUNNING).
    };

    console.log("RESUME_OPTIMISTIC", {
      timeRemaining: pausedTimeRemaining,
      optimisticStartedAt,
    });

    runCommand(
      "ROUND_RESUME",
      optimistic,
      {
        event: "ROUND_RESUME",
        payload: {
          roundId: round.id,
          startedAt: optimisticStartedAt,
          timeRemaining: pausedTimeRemaining,
          status: "RUNNING",
        },
      },
      () =>
        resumeRemoteRound(round.id, pausedTimeRemaining).then((confirmed) => {
          console.log("RESUME_REMOTE_RESULT", {
            timeRemaining: confirmed.time_remaining,
            startedAt: confirmed.started_at,
          });
          return confirmed;
        }),
    );
  }, [round, runCommand, timeRemaining]);

  const resetRound = useCallback(() => {
    if (!round) return;

    const optimistic: RoundRecord = {
      ...round,
      status: "IDLE",
      started_at: null,
      paused_at: null,
      finished_at: null,
      time_remaining: ROUND_DURATION_SECONDS,
      current_phase: "MOMENTO_1",
    };

    runCommand(
      "ROUND_RESET",
      optimistic,
      {
        event: "ROUND_RESET",
        payload: {
          roundId: round.id,
          timeRemaining: ROUND_DURATION_SECONDS,
          phase: "MOMENTO_1",
          status: "IDLE",
        },
      },
      () => resetRemoteRound(round.id),
    );
  }, [round, runCommand]);

  return {
    round,
    loading,
    error,
    timeRemaining,
    status,
    phase,
    syncMessage,
    isPending,
    startRound,
    pauseRound,
    resumeRound,
    resetRound,
  };
}
