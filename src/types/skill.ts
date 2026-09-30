/**
 * Características reutilizáveis de comportamento tático associadas a uma
 * skill (ver `SkillRecord.characteristics`). Campos conhecidos são
 * opcionais e tipados; `[key: string]: unknown` mantém o jsonb flexível
 * para características futuras sem exigir migration de schema.
 */
export interface SkillCharacteristics {
  survival_priority?: "LOW" | "MEDIUM" | "HIGH";
  aggression?: "LOW" | "MEDIUM" | "HIGH";
  trade_priority?: "LOW" | "MEDIUM" | "HIGH";
  rotation_behavior?: string;
  rotation_responsibility?: string;
  utility_responsibility?: string;
  numbers_advantage_behavior?: string;
  numbers_disadvantage_behavior?: string;
  advance_trigger?: string;
  retreat_trigger?: string;
  [key: string]: unknown;
}

/**
 * Perfil tático reutilizável (linha de `skills`) — ex: ANCHOR_B, LURKER,
 * ENTRY_FRAGGER, AWPER_AGGRESSIVE. Referenciado por `setup_assignments.skill_id`
 * e não por jogador diretamente: a mesma skill pode ser atribuída a
 * jogadores diferentes em setups diferentes.
 */
export interface SkillRecord {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  characteristics: SkillCharacteristics | null;
  created_at: string;
  updated_at: string;
}
