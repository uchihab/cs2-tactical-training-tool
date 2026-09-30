import { createClient } from "./client";
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

interface SupabaseErrorLike {
  message: string;
  code: string;
  details: string;
  hint: string;
}

function logMatchContextError(label: string, error: SupabaseErrorLike) {
  console.error(label, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

/**
 * Contexto MAPA -> LADO -> ESTRATÉGIA -> SETUP -> ASSIGNMENT (+ SKILL) de um
 * player para o setup ativo do round. `assignment`/`skill` ficam `null` (sem
 * lançar erro) quando o setup existe mas não tem assignment cadastrado para
 * esse player — ver `usePlayerTacticalContext`.
 */
export interface SetupAssignmentContext {
  map: MapRecord | null;
  side: Side | null;
  strategy: StrategyRecord | null;
  setup: SetupRecord | null;
  assignment: SetupAssignmentRecord | null;
  skill: SkillRecord | null;
}

interface SetupWithStrategyAndMap extends SetupRecord {
  strategies: (StrategyRecord & { maps: MapRecord | null }) | null;
}

interface AssignmentWithSkill extends SetupAssignmentRecord {
  skills: SkillRecord | null;
}

/**
 * Resolve MAPA -> LADO -> ESTRATÉGIA -> SETUP -> ASSIGNMENT -> SKILL para um
 * player, a partir do `setupId` ativo no round. Lança erro (técnico, logado
 * no console) somente quando o próprio setup não existe/falha ao carregar —
 * a ausência de assignment para o player é um estado normal, não um erro.
 */
export async function getSetupAssignmentContext(input: {
  setupId: string;
  playerId: string;
}): Promise<SetupAssignmentContext> {
  const { setupId, playerId } = input;
  const supabase = createClient();

  const { data: setupData, error: setupError } = await supabase
    .from("setups")
    .select("*, strategies(*, maps(*))")
    .eq("id", setupId)
    .maybeSingle();

  if (setupError) {
    logMatchContextError("GET SETUP ASSIGNMENT CONTEXT SETUP ERROR", setupError);
    throw new Error("SETUP NÃO ENCONTRADO");
  }

  if (!setupData) {
    throw new Error("SETUP NÃO ENCONTRADO");
  }

  const { strategies: strategy, ...setup } = setupData as unknown as SetupWithStrategyAndMap;
  const map = strategy?.maps ?? null;

  const { data: assignmentData, error: assignmentError } = await supabase
    .from("setup_assignments")
    .select("*, skills(*)")
    .eq("setup_id", setupId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (assignmentError) {
    logMatchContextError("GET SETUP ASSIGNMENT CONTEXT ASSIGNMENT ERROR", assignmentError);
    throw new Error("PLAYER SEM ASSIGNMENT");
  }

  if (!assignmentData) {
    return { map, side: strategy?.side ?? null, strategy, setup, assignment: null, skill: null };
  }

  const { skills: skill, ...assignment } = assignmentData as unknown as AssignmentWithSkill;

  return { map, side: strategy?.side ?? null, strategy, setup, assignment, skill };
}

/**
 * Instrução de um assignment para o momento atual do round — a de menor
 * `sequence_order` quando houver mais de uma para o mesmo momento. `null`
 * (sem lançar erro) quando não há instrução cadastrada para esse momento.
 */
export async function getInstructionForPhase(input: {
  assignmentId: string;
  phase: RoundPhase;
}): Promise<SetupInstructionRecord | null> {
  const { assignmentId, phase } = input;
  const supabase = createClient();

  const { data, error } = await supabase
    .from("setup_instructions")
    .select()
    .eq("setup_assignment_id", assignmentId)
    .eq("round_phase", phase)
    .order("sequence_order", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logMatchContextError("GET INSTRUCTION FOR PHASE ERROR", error);
    throw new Error("ERRO AO CARREGAR INSTRUÇÃO");
  }

  return (data as SetupInstructionRecord | null) ?? null;
}
