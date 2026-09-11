import type { RoundPhaseInfo, RoundStatus } from "@/types";

interface RoundTimerProps {
  timeRemaining: number;
  status: RoundStatus;
  phase: RoundPhaseInfo;
}

const STATUS_LABELS: Record<RoundStatus, string> = {
  IDLE: "Aguardando início",
  RUNNING: "Em andamento",
  PAUSED: "Pausado",
  FINISHED: "Round finalizado",
};

function formatTime(totalSeconds: number): string {
  // timeRemaining pode chegar decimal (calculado a partir de now - started_at);
  // a exibição sempre arredonda para o segundo inteiro seguinte antes de formatar.
  const wholeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Cronômetro visual do round: tempo restante, status e momento/fase atual.
 * Reutilizável — recebe todo o estado via props (nenhuma lógica própria).
 */
export function RoundTimer({ timeRemaining, status, phase }: RoundTimerProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Cronômetro do round
      </p>
      <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-zinc-100">
        {formatTime(timeRemaining)}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {STATUS_LABELS[status]}
      </p>

      <div className="mt-3 border-t border-zinc-800 pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Momento/fase atual
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-100">{phase.label}</p>
        <p className="mt-1 text-sm text-zinc-400">{phase.objective}</p>
      </div>
    </div>
  );
}
