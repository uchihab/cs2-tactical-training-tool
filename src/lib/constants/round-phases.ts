import type { RoundPhaseInfo } from "@/types";

/**
 * Definição estática dos 3 momentos do round.
 * Tempo em segundos restantes no relógio (1:55 -> 115s, 1:25 -> 85s, 0:55 -> 55s, 0:00 -> 0s).
 */
export const ROUND_PHASES: readonly RoundPhaseInfo[] = [
  {
    id: "MOMENTO_1",
    label: "Momento 1",
    startTime: 115,
    endTime: 85,
    objective: "Domínio inicial e coleta de informação.",
  },
  {
    id: "MOMENTO_2",
    label: "Momento 2",
    startTime: 85,
    endTime: 55,
    objective: "Pressão, leitura, preparação e decisão.",
  },
  {
    id: "MOMENTO_3",
    label: "Momento 3",
    startTime: 55,
    endTime: 0,
    objective: "Execução e fechamento.",
  },
] as const;
