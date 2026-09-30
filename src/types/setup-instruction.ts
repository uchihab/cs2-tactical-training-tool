import type { RoundPhase } from "./round";

/**
 * Instrução de um `setup_assignment` para um momento específico do round
 * (linha de `setup_instructions`). Permite que a instrução exibida para um
 * player mude automaticamente conforme a fase do round avança, sem trocar
 * de setup — ex: MOMENTO_1 "segure a posição", MOMENTO_2 "corte se ouvir
 * bomba B", com `next_instruction` apontando a transição esperada.
 */
export interface SetupInstructionRecord {
  id: string;
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
  created_at: string;
}
