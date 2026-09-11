/**
 * Momento/fase do round. O round é dividido em 3 momentos táticos.
 */
export type RoundPhase = "MOMENTO_1" | "MOMENTO_2" | "MOMENTO_3";

/**
 * Metadados descritivos de cada fase (janela de tempo e objetivo).
 * O tempo é expresso em segundos restantes no relógio do round.
 */
export interface RoundPhaseInfo {
  id: RoundPhase;
  label: string;
  startTime: number;
  endTime: number;
  objective: string;
}
