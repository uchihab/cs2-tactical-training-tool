import { createClient } from "../client";
import { logPlaybookError } from "./errors";
import type { RoundPhase, SetupInstructionRecord } from "@/types";

/** Instruções de um assignment, ordenadas por momento e depois por sequência. */
export async function listInstructionsForAssignment(
  assignmentId: string,
): Promise<SetupInstructionRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("setup_instructions")
    .select()
    .eq("setup_assignment_id", assignmentId)
    .order("round_phase", { ascending: true })
    .order("sequence_order", { ascending: true, nullsFirst: false });

  if (error) {
    logPlaybookError("LIST SETUP INSTRUCTIONS ERROR", error);
    throw new Error("Não foi possível carregar as instruções.");
  }

  return (data ?? []) as SetupInstructionRecord[];
}

export interface CreateInstructionInput {
  setup_assignment_id: string;
  round_phase: RoundPhase;
  title: string;
  instruction: string;
  objective: string | null;
  trigger: string | null;
  next_instruction: string | null;
  utility_type: string | null;
  utility_target: string | null;
  sequence_order: number | null;
}

export async function createInstruction(
  input: CreateInstructionInput,
): Promise<SetupInstructionRecord> {
  const supabase = createClient();
  const { data, error } = await supabase.from("setup_instructions").insert(input).select().single();

  if (error) {
    logPlaybookError("CREATE SETUP INSTRUCTION ERROR", error);
    throw new Error("Não foi possível salvar a instrução.");
  }

  return data as SetupInstructionRecord;
}
