import { createClient } from "./client";
import { ROUND_DURATION_SECONDS } from "@/lib/constants/round-phases";
import type { RoundPhase, RoundRecord, Side } from "@/types";

interface SupabaseErrorLike {
  message: string;
  code: string;
  details: string;
  hint: string;
}

function logRoundError(label: string, error: SupabaseErrorLike) {
  console.error(label, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

/**
 * Busca o round de uma sala. Cada sala tem um único round (criado junto com
 * ela), então isto sempre retorna o round mais recente daquela sala — nunca
 * de outra.
 */
export async function getActiveRound(roomId: string): Promise<RoundRecord | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("rounds")
    .select()
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logRoundError("GET ACTIVE ROUND ERROR", error);
    throw new Error("Não foi possível carregar o round da sala.");
  }

  return data as RoundRecord | null;
}

async function updateRound(
  roundId: string,
  patch: Partial<
    Pick<
      RoundRecord,
      | "status"
      | "started_at"
      | "paused_at"
      | "finished_at"
      | "time_remaining"
      | "current_phase"
    >
  >,
): Promise<RoundRecord> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("rounds")
    .update(patch)
    .eq("id", roundId)
    .select()
    .single();

  if (error) {
    logRoundError("UPDATE ROUND ERROR", error);
    throw new Error("Não foi possível atualizar o round.");
  }

  return data as RoundRecord;
}

/** IGL: inicia (ou reinicia do zero) o round para todos os dispositivos. */
export async function startRemoteRound(roundId: string): Promise<RoundRecord> {
  return updateRound(roundId, {
    status: "RUNNING",
    started_at: new Date().toISOString(),
    paused_at: null,
    finished_at: null,
    time_remaining: ROUND_DURATION_SECONDS,
    current_phase: "MOMENTO_1",
  });
}

/** IGL: pausa o round, congelando `timeRemaining` (calculado localmente) no banco. */
export async function pauseRemoteRound(roundId: string, timeRemaining: number): Promise<RoundRecord> {
  return updateRound(roundId, {
    status: "PAUSED",
    paused_at: new Date().toISOString(),
    time_remaining: Math.max(0, Math.round(timeRemaining)),
  });
}

/**
 * IGL: retoma o round a partir de `timeRemaining` salvo, recalculando um
 * `started_at` que preserva o tempo já decorrido.
 */
export async function resumeRemoteRound(roundId: string, timeRemaining: number): Promise<RoundRecord> {
  const elapsedAlready = ROUND_DURATION_SECONDS - timeRemaining;
  const startedAt = new Date(Date.now() - elapsedAlready * 1000).toISOString();

  return updateRound(roundId, {
    status: "RUNNING",
    started_at: startedAt,
    paused_at: null,
  });
}

/** IGL: volta o round para o estado inicial (1:55, Momento 1, idle). */
export async function resetRemoteRound(roundId: string): Promise<RoundRecord> {
  return updateRound(roundId, {
    status: "IDLE",
    started_at: null,
    paused_at: null,
    finished_at: null,
    time_remaining: ROUND_DURATION_SECONDS,
    current_phase: "MOMENTO_1",
  });
}

/** IGL: marca o round como finalizado quando o cronômetro chega a zero. */
export async function finishRemoteRound(roundId: string): Promise<RoundRecord> {
  return updateRound(roundId, {
    status: "FINISHED",
    time_remaining: 0,
    finished_at: new Date().toISOString(),
    current_phase: "MOMENTO_3",
  });
}

/** IGL: grava a fase atual, apenas quando ela muda (nunca a cada tick). */
export async function updateRoundPhase(roundId: string, phase: RoundPhase): Promise<RoundRecord> {
  return updateRound(roundId, { current_phase: phase });
}

export interface ActivateRoundSetupInput {
  roundId: string;
  mapId: string;
  side: Side;
  strategyId: string;
  setupId: string;
}

/**
 * IGL: ativa MAPA -> LADO -> ESTRATÉGIA -> SETUP no round, num único UPDATE.
 * Independente do cronômetro de propósito — nunca toca status/started_at/
 * paused_at/finished_at/time_remaining/current_phase, então pode ser chamado
 * com o round RUNNING sem afetar o timer. Players conectados recebem a
 * mudança de `setup_id` pelo mesmo Realtime que já sincroniza `rounds`.
 */
export async function activateRoundSetup(input: ActivateRoundSetupInput): Promise<RoundRecord> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("rounds")
    .update({
      map_id: input.mapId,
      side: input.side,
      strategy_id: input.strategyId,
      setup_id: input.setupId,
    })
    .eq("id", input.roundId)
    .select()
    .single();

  if (error) {
    logRoundError("ACTIVATE ROUND SETUP ERROR", error);
    throw new Error("Não foi possível ativar o setup.");
  }

  return data as RoundRecord;
}
