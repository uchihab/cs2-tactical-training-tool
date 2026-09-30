import { createClient } from "../client";
import { logPlaybookError } from "./errors";
import type { Side, SetupRecord } from "@/types";

/** Setups de uma estratégia, por prioridade e depois por data de criação. */
export async function listSetupsByStrategy(strategyId: string): Promise<SetupRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("setups")
    .select()
    .eq("strategy_id", strategyId)
    .order("priority", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    logPlaybookError("LIST SETUPS ERROR", error);
    throw new Error("Não foi possível carregar os setups.");
  }

  return (data ?? []) as SetupRecord[];
}

export interface SetupWithStrategy extends SetupRecord {
  strategies: {
    id: string;
    name: string;
    side: Side;
    map_id: string;
    maps: { name: string } | null;
  } | null;
}

/** Setup com a estratégia e o mapa embutidos, para breadcrumb do editor. */
export async function getSetupById(id: string): Promise<SetupWithStrategy> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("setups")
    .select("*, strategies(id, name, side, map_id, maps(name))")
    .eq("id", id)
    .single();

  if (error) {
    logPlaybookError("GET SETUP ERROR", error);
    throw new Error("Não foi possível carregar o setup.");
  }

  return data as unknown as SetupWithStrategy;
}

export interface SetupInput {
  strategy_id: string;
  name: string;
  description: string | null;
  priority: number | null;
  active: boolean;
}

export async function createSetup(input: SetupInput): Promise<SetupRecord> {
  const supabase = createClient();
  const { data, error } = await supabase.from("setups").insert(input).select().single();

  if (error) {
    logPlaybookError("CREATE SETUP ERROR", error);
    throw new Error("Não foi possível criar o setup.");
  }

  return data as SetupRecord;
}

export async function updateSetup(id: string, patch: Partial<SetupInput>): Promise<SetupRecord> {
  const supabase = createClient();
  const { data, error } = await supabase.from("setups").update(patch).eq("id", id).select().single();

  if (error) {
    logPlaybookError("UPDATE SETUP ERROR", error);
    throw new Error("Não foi possível atualizar o setup.");
  }

  return data as SetupRecord;
}

/**
 * Gera um nome livre dentro da estratégia alvo a partir de `baseName`,
 * anexando um contador quando já existir (constraint unique
 * `(strategy_id, name)`).
 */
async function uniqueSetupName(strategyId: string, baseName: string): Promise<string> {
  const supabase = createClient();
  let candidate = baseName;

  for (let attempt = 1; attempt <= 20; attempt++) {
    const { data, error } = await supabase
      .from("setups")
      .select("id")
      .eq("strategy_id", strategyId)
      .eq("name", candidate)
      .maybeSingle();

    if (error) {
      logPlaybookError("CHECK SETUP NAME ERROR", error);
      throw new Error("Não foi possível gerar um nome único para o setup.");
    }

    if (!data) return candidate;
    candidate = `${baseName} (${attempt + 1})`;
  }

  throw new Error("Não foi possível gerar um nome único para o setup.");
}

/**
 * Duplica um setup — incluindo `setup_assignments` e `setup_instructions` —
 * para dentro de `targetStrategyId` (que pode ser a mesma estratégia do
 * original, no caso de "duplicar setup", ou uma estratégia recém-duplicada,
 * no caso de "duplicar estratégia"; ver `strategies.ts`).
 */
export async function duplicateSetupInto(
  setupId: string,
  targetStrategyId: string,
): Promise<SetupRecord> {
  const supabase = createClient();

  const { data: original, error: originalError } = await supabase
    .from("setups")
    .select()
    .eq("id", setupId)
    .single();

  if (originalError || !original) {
    logPlaybookError(
      "DUPLICATE SETUP LOAD ERROR",
      originalError ?? { message: "setup not found", code: "", details: "", hint: "" },
    );
    throw new Error("Não foi possível carregar o setup a duplicar.");
  }

  const newName = await uniqueSetupName(targetStrategyId, `${original.name} — CÓPIA`);

  const duplicated = await createSetup({
    strategy_id: targetStrategyId,
    name: newName,
    description: original.description,
    priority: original.priority,
    active: original.active,
  });

  const { data: assignments, error: assignmentsError } = await supabase
    .from("setup_assignments")
    .select()
    .eq("setup_id", setupId);

  if (assignmentsError) {
    logPlaybookError("DUPLICATE SETUP ASSIGNMENTS LOAD ERROR", assignmentsError);
    throw new Error("Não foi possível copiar os assignments do setup.");
  }

  for (const assignment of assignments ?? []) {
    const { data: newAssignment, error: insertAssignmentError } = await supabase
      .from("setup_assignments")
      .insert({
        setup_id: duplicated.id,
        player_id: assignment.player_id,
        role: assignment.role,
        tactical_assignment: assignment.tactical_assignment,
        skill_id: assignment.skill_id,
        position: assignment.position,
        priority: assignment.priority,
      })
      .select()
      .single();

    if (insertAssignmentError || !newAssignment) {
      logPlaybookError(
        "DUPLICATE SETUP ASSIGNMENT INSERT ERROR",
        insertAssignmentError ?? { message: "insert failed", code: "", details: "", hint: "" },
      );
      throw new Error("Não foi possível copiar um assignment do setup.");
    }

    const { data: instructions, error: instructionsError } = await supabase
      .from("setup_instructions")
      .select()
      .eq("setup_assignment_id", assignment.id);

    if (instructionsError) {
      logPlaybookError("DUPLICATE SETUP INSTRUCTIONS LOAD ERROR", instructionsError);
      throw new Error("Não foi possível copiar as instruções do setup.");
    }

    if (instructions && instructions.length > 0) {
      const { error: insertInstructionsError } = await supabase.from("setup_instructions").insert(
        instructions.map((instruction) => ({
          setup_assignment_id: newAssignment.id,
          round_phase: instruction.round_phase,
          title: instruction.title,
          instruction: instruction.instruction,
          objective: instruction.objective,
          trigger: instruction.trigger,
          next_instruction: instruction.next_instruction,
          utility_type: instruction.utility_type,
          utility_target: instruction.utility_target,
          sequence_order: instruction.sequence_order,
        })),
      );

      if (insertInstructionsError) {
        logPlaybookError("DUPLICATE SETUP INSTRUCTIONS INSERT ERROR", insertInstructionsError);
        throw new Error("Não foi possível copiar as instruções do setup.");
      }
    }
  }

  return duplicated;
}

/** Duplica um setup dentro da mesma estratégia à qual ele já pertence. */
export async function duplicateSetup(setupId: string): Promise<SetupRecord> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("setups")
    .select("strategy_id")
    .eq("id", setupId)
    .single();

  if (error || !data) {
    logPlaybookError(
      "DUPLICATE SETUP FIND STRATEGY ERROR",
      error ?? { message: "setup not found", code: "", details: "", hint: "" },
    );
    throw new Error("Não foi possível localizar o setup a duplicar.");
  }

  return duplicateSetupInto(setupId, data.strategy_id);
}
