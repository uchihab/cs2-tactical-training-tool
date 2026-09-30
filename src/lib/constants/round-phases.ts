import type { RoundPhaseInfo } from "@/types";

/**
 * Definição estática dos 3 momentos do round.
 *
 * Regra oficial (em tempo de relógio):
 *   MOMENTO_1: 1:55 até 0:59
 *   MOMENTO_2: 0:59 até 0:30
 *   MOMENTO_3: 0:30 até os segundos finais (segue até o plant)
 *
 * Implementado com thresholds em segundos restantes que não se sobrepõem
 * (para nunca deixar ambíguo a quem pertence um segundo exato):
 *   MOMENTO_1: 115 até 60
 *   MOMENTO_2: 59 até 31
 *   MOMENTO_3: 30 até 0
 *
 * MOMENTO_3 não termina conceitualmente em 0:00 — cobre os segundos finais
 * até o plant. Um estado de pós-plant (POST_PLANT_PHASE) é um conceito
 * futuro, ainda não implementado: nesta etapa, MOMENTO_3 simplesmente
 * permanece até o fim do round.
 */
export const ROUND_PHASES: readonly RoundPhaseInfo[] = [
  {
    id: "MOMENTO_1",
    label: "Momento 1",
    startTime: 115,
    endTime: 60,
    range: "1:55 → 0:59",
    objective: "Domínio inicial e coleta de informação.",
  },
  {
    id: "MOMENTO_2",
    label: "Momento 2",
    startTime: 59,
    endTime: 31,
    range: "0:59 → 0:30",
    objective: "Pressão, leitura, preparação e decisão.",
  },
  {
    id: "MOMENTO_3",
    label: "Momento 3",
    startTime: 30,
    endTime: 0,
    range: "0:30 → segundos finais / até o plant",
    objective: "Execução e fechamento.",
  },
] as const;

/** Duração total do round, em segundos, derivada do início do Momento 1 (1:55). */
export const ROUND_DURATION_SECONDS = ROUND_PHASES[0].startTime;

/** Resolve qual fase corresponde a um tempo restante (em segundos). */
export function getPhaseForTime(time: number): RoundPhaseInfo {
  return (
    ROUND_PHASES.find((phase) => time <= phase.startTime && time >= phase.endTime) ??
    ROUND_PHASES[ROUND_PHASES.length - 1]
  );
}
