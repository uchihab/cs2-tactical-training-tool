"use client";

import { useEffect, useState } from "react";
import { useRoundState } from "./useRoundState";
import {
  getInstructionForPhase,
  getSetupAssignmentContext,
  type SetupAssignmentContext,
} from "@/lib/supabase/matchContext";
import type {
  MapRecord,
  RoundPhase,
  SetupAssignmentRecord,
  SetupInstructionRecord,
  SetupRecord,
  Side,
  SkillRecord,
  StrategyRecord,
} from "@/types";

export interface UsePlayerTacticalContextResult {
  map: MapRecord | null;
  side: Side | null;
  strategy: StrategyRecord | null;
  setup: SetupRecord | null;
  assignment: SetupAssignmentRecord | null;
  skill: SkillRecord | null;
  instruction: SetupInstructionRecord | null;
  loading: boolean;
  error: string | null;
}

const EMPTY_ASSIGNMENT_CONTEXT: SetupAssignmentContext = {
  map: null,
  side: null,
  strategy: null,
  setup: null,
  assignment: null,
  skill: null,
};

/**
 * Contexto tático dinâmico de um player: lê o round ativo da sala (mesmo
 * Realtime de `useRemoteRound`/`useRoundState` — nenhuma subscrição nova) e,
 * quando `setup_id` está definido, resolve
 * MAP -> SIDE -> STRATEGY -> SETUP -> SETUP_ASSIGNMENT -> SKILL, mais a
 * instrução do `currentPhase` atual. Refaz a busca do setup/assignment/skill
 * só quando `setup_id` muda; refaz só a instrução quando `currentPhase` muda
 * (sem tocar assignment/skill) — nunca a cada tick do cronômetro.
 *
 * Sem setup ativo (`setup_id` null), retorna tudo `null` sem erro — a tela
 * mostra "AGUARDANDO SETUP". Sem assignment para o player naquele setup,
 * `assignment`/`skill`/`instruction` ficam `null` sem erro — a tela mostra
 * "SEM ASSIGNMENT PARA ESTE SETUP" (ver JoinRoomForm).
 */
export function usePlayerTacticalContext(
  roomId: string | null,
  playerId: string | null,
  currentPhase: RoundPhase | null,
): UsePlayerTacticalContextResult {
  const { round } = useRoundState(roomId);
  const setupId = round?.setup_id ?? null;

  const [assignmentContext, setAssignmentContext] = useState(EMPTY_ASSIGNMENT_CONTEXT);
  const [instruction, setInstruction] = useState<SetupInstructionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recarrega mapa/lado/estratégia/setup/assignment/skill só quando o setup
  // ativo (ou o player) muda.
  useEffect(() => {
    if (!setupId || !playerId) {
      setAssignmentContext(EMPTY_ASSIGNMENT_CONTEXT);
      setInstruction(null);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getSetupAssignmentContext({ setupId, playerId })
      .then((context) => {
        if (!active) return;
        setAssignmentContext(context);
      })
      .catch((err) => {
        if (!active) return;
        console.error("PLAYER TACTICAL CONTEXT ERROR", err);
        setAssignmentContext(EMPTY_ASSIGNMENT_CONTEXT);
        setInstruction(null);
        setError(err instanceof Error ? err.message : "ERRO AO CARREGAR CONTEXTO TÁTICO");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [setupId, playerId]);

  // Recarrega só a instrução quando o assignment resolvido ou o momento
  // atual do round muda — nunca a cada segundo do cronômetro.
  useEffect(() => {
    const assignmentId = assignmentContext.assignment?.id ?? null;

    if (!assignmentId || !currentPhase) {
      setInstruction(null);
      return;
    }

    let active = true;

    getInstructionForPhase({ assignmentId, phase: currentPhase })
      .then((result) => {
        if (!active) return;
        setInstruction(result);
      })
      .catch((err) => {
        if (!active) return;
        console.error("PLAYER TACTICAL INSTRUCTION ERROR", err);
        setInstruction(null);
        setError(err instanceof Error ? err.message : "ERRO AO CARREGAR INSTRUÇÃO");
      });

    return () => {
      active = false;
    };
  }, [assignmentContext.assignment?.id, currentPhase]);

  return {
    ...assignmentContext,
    instruction,
    loading,
    error,
  };
}
