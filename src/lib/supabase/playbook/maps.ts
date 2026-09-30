import { createClient } from "../client";
import { logPlaybookError } from "./errors";
import type { MapRecord } from "@/types";

/**
 * Mapas ativos de `public.maps`, em ordem alfabética. Fonte ÚNICA de mapas —
 * usada tanto por /playbook quanto pela seção "Contexto tático" do /igl
 * (`TacticalSetupControl`). Não depende de nenhuma outra seleção (lado,
 * estratégia, etc.) — só de `active = true`.
 */
export async function getActiveMaps(): Promise<MapRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("maps")
    .select("id, name, active, created_at")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    logPlaybookError("GET ACTIVE MAPS ERROR", error);
    throw new Error("Não foi possível carregar os mapas.");
  }

  return (data ?? []) as MapRecord[];
}
