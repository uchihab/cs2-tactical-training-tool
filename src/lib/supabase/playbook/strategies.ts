import { createClient } from "../client";
import { logPlaybookError } from "./errors";
import { duplicateSetupInto, listSetupsByStrategy } from "./setups";
import type { Side, StrategyRecord } from "@/types";

/** Estratégias de um mapa+lado, na ordem em que foram criadas. */
export async function listStrategies(mapId: string, side: Side): Promise<StrategyRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("strategies")
    .select()
    .eq("map_id", mapId)
    .eq("side", side)
    .order("created_at", { ascending: true });

  if (error) {
    logPlaybookError("LIST STRATEGIES ERROR", error);
    throw new Error("Não foi possível carregar as estratégias.");
  }

  return (data ?? []) as StrategyRecord[];
}

export interface StrategyWithMap extends StrategyRecord {
  maps: { name: string } | null;
}

/** Estratégia com o mapa embutido, para o cabeçalho do editor. */
export async function getStrategyById(id: string): Promise<StrategyWithMap> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("strategies")
    .select("*, maps(name)")
    .eq("id", id)
    .single();

  if (error) {
    logPlaybookError("GET STRATEGY ERROR", error);
    throw new Error("Não foi possível carregar a estratégia.");
  }

  return data as unknown as StrategyWithMap;
}

export interface StrategyInput {
  map_id: string;
  side: Side;
  name: string;
  description: string | null;
  created_by: string | null;
  active: boolean;
}

export async function createStrategy(input: StrategyInput): Promise<StrategyRecord> {
  const supabase = createClient();
  const { data, error } = await supabase.from("strategies").insert(input).select().single();

  if (error) {
    logPlaybookError("CREATE STRATEGY ERROR", error);
    throw new Error("Não foi possível criar a estratégia.");
  }

  return data as StrategyRecord;
}

export async function updateStrategy(
  id: string,
  patch: Partial<StrategyInput>,
): Promise<StrategyRecord> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("strategies")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    logPlaybookError("UPDATE STRATEGY ERROR", error);
    throw new Error("Não foi possível atualizar a estratégia.");
  }

  return data as StrategyRecord;
}

/**
 * Gera um nome livre dentro do mapa+lado alvo a partir de `baseName`,
 * anexando um contador quando já existir (constraint unique
 * `(map_id, side, name)`).
 */
async function uniqueStrategyName(mapId: string, side: Side, baseName: string): Promise<string> {
  const supabase = createClient();
  let candidate = baseName;

  for (let attempt = 1; attempt <= 20; attempt++) {
    const { data, error } = await supabase
      .from("strategies")
      .select("id")
      .eq("map_id", mapId)
      .eq("side", side)
      .eq("name", candidate)
      .maybeSingle();

    if (error) {
      logPlaybookError("CHECK STRATEGY NAME ERROR", error);
      throw new Error("Não foi possível gerar um nome único para a estratégia.");
    }

    if (!data) return candidate;
    candidate = `${baseName} (${attempt + 1})`;
  }

  throw new Error("Não foi possível gerar um nome único para a estratégia.");
}

/**
 * Duplica uma estratégia inteira: a linha de `strategies`, e em cascata
 * todos os seus `setups` (com `setup_assignments`/`setup_instructions` —
 * ver `duplicateSetupInto` em `setups.ts`).
 */
export async function duplicateStrategy(id: string): Promise<StrategyRecord> {
  const original = await getStrategyById(id);
  const newName = await uniqueStrategyName(original.map_id, original.side, `${original.name} — CÓPIA`);

  const duplicated = await createStrategy({
    map_id: original.map_id,
    side: original.side,
    name: newName,
    description: original.description,
    created_by: original.created_by,
    active: original.active,
  });

  const setups = await listSetupsByStrategy(id);
  for (const setup of setups) {
    await duplicateSetupInto(setup.id, duplicated.id);
  }

  return duplicated;
}
