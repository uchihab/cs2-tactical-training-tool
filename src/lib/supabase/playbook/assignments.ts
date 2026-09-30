import { createClient } from "../client";
import { logPlaybookError } from "./errors";
import type { SetupAssignmentRecord, TacticalAssignment } from "@/types";

export interface AssignmentWithRelations extends SetupAssignmentRecord {
  players: { id: string; nickname: string | null } | null;
  skills: { id: string; name: string } | null;
}

/** Assignments de um setup, com o nickname do player e o nome da skill embutidos. */
export async function listAssignmentsForSetup(setupId: string): Promise<AssignmentWithRelations[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("setup_assignments")
    .select("*, players(id, nickname), skills(id, name)")
    .eq("setup_id", setupId);

  if (error) {
    logPlaybookError("LIST SETUP ASSIGNMENTS ERROR", error);
    throw new Error("Não foi possível carregar os assignments do setup.");
  }

  return (data ?? []) as unknown as AssignmentWithRelations[];
}

export interface UpsertAssignmentInput {
  setup_id: string;
  player_id: string;
  role: string | null;
  tactical_assignment: TacticalAssignment | null;
  skill_id: string | null;
  position: string | null;
  priority: string | null;
}

/**
 * Cria ou atualiza o assignment de um player num setup (constraint unique
 * `(setup_id, player_id)` garante no máximo uma linha por player por setup).
 */
export async function upsertAssignment(input: UpsertAssignmentInput): Promise<SetupAssignmentRecord> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("setup_assignments")
    .upsert(input, { onConflict: "setup_id,player_id" })
    .select()
    .single();

  if (error) {
    logPlaybookError("UPSERT SETUP ASSIGNMENT ERROR", error);
    throw new Error("Não foi possível salvar o assignment.");
  }

  return data as SetupAssignmentRecord;
}
