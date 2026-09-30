/**
 * Momento/fase do round. O round é dividido em 3 momentos táticos.
 */
export type RoundPhase = "MOMENTO_1" | "MOMENTO_2" | "MOMENTO_3";

/**
 * Estado do cronômetro do round.
 */
export type RoundStatus = "IDLE" | "RUNNING" | "PAUSED" | "FINISHED";

/**
 * Metadados descritivos de cada fase (janela de tempo e objetivo).
 * O tempo é expresso em segundos restantes no relógio do round.
 */
export interface RoundPhaseInfo {
  id: RoundPhase;
  label: string;
  startTime: number;
  endTime: number;
  /** Faixa de tempo em formato de relógio, para exibição (ex: "1:55 → 0:59"). */
  range: string;
  objective: string;
}
