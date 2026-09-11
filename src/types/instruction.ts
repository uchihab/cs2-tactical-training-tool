import type { PlayerRole } from "./player";
import type { RoundPhase } from "./round";

/**
 * Instrução tática direcionada a uma função específica em uma fase do round.
 * Representa o dado que futuramente virá do Supabase Realtime.
 */
export interface Instruction {
  id: string;
  role: PlayerRole;
  phase: RoundPhase;
  title: string;
  description: string;
}
