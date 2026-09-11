import type { RoundPhase, RoundStatus } from "./round";

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
  created_at: string;
  updated_at: string;
}
