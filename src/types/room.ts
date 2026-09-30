import type { RoundPhase, RoundStatus } from "./round";
import type { Side } from "./side";

/**
 * Sala compartilhada entre as 5 funções (linha de `team_rooms`).
 */
export interface TeamRoom {
  id: string;
  code: string;
  name: string | null;
  created_at: string;
  active: boolean;
}

/**
 * Estado do round persistido no Supabase (linha de `rounds`).
 *
 * `map_id`/`side`/`strategy_id`/`setup_id` guardam a seleção MAPA -> LADO ->
 * ESTRATÉGIA -> SETUP feita pelo IGL para este round — a fonte de verdade
 * dinâmica descrita em `setup-assignment.ts`. `active_strategy` é o campo
 * legado (texto livre, sem ligação com `strategies`/`setups`) mantido só por
 * compatibilidade enquanto a tela do IGL não migra para os seletores novos.
 */
export interface RoundRecord {
  id: string;
  room_id: string;
  status: RoundStatus;
  started_at: string | null;
  paused_at: string | null;
  finished_at: string | null;
  time_remaining: number;
  current_phase: RoundPhase | null;
  active_strategy: string | null;
  map_id: string | null;
  side: Side | null;
  strategy_id: string | null;
  setup_id: string | null;
  created_at: string;
  updated_at: string;
}
