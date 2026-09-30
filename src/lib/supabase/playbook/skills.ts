import { createClient } from "../client";
import { logPlaybookError } from "./errors";
import type { SkillCharacteristics, SkillRecord } from "@/types";

/** Lista todas as skills cadastradas, em ordem alfabética. */
export async function listSkills(): Promise<SkillRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("skills").select().order("name", { ascending: true });

  if (error) {
    logPlaybookError("LIST SKILLS ERROR", error);
    throw new Error("Não foi possível carregar as skills.");
  }

  return (data ?? []) as SkillRecord[];
}

export interface SkillInput {
  name: string;
  category: string | null;
  description: string | null;
  characteristics: SkillCharacteristics | null;
}

export async function createSkill(input: SkillInput): Promise<SkillRecord> {
  const supabase = createClient();
  const { data, error } = await supabase.from("skills").insert(input).select().single();

  if (error) {
    logPlaybookError("CREATE SKILL ERROR", error);
    throw new Error("Não foi possível criar a skill.");
  }

  return data as SkillRecord;
}

export async function updateSkill(id: string, patch: Partial<SkillInput>): Promise<SkillRecord> {
  const supabase = createClient();
  const { data, error } = await supabase.from("skills").update(patch).eq("id", id).select().single();

  if (error) {
    logPlaybookError("UPDATE SKILL ERROR", error);
    throw new Error("Não foi possível atualizar a skill.");
  }

  return data as SkillRecord;
}
