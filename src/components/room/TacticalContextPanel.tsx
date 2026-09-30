import type { UsePlayerTacticalContextResult } from "@/hooks/usePlayerTacticalContext";

type TacticalContextPanelProps = UsePlayerTacticalContextResult;

const TACTICAL_ASSIGNMENT_LABELS: Record<string, string> = {
  LURK: "Lurk",
  CUT_ROTATION: "Cortar rotação",
  SECOND_ENTRY: "Segunda entrada",
  TRADE: "Trade",
  HOLD: "Hold",
  EXECUTE: "Execute",
  SUPPORT_UTILITY: "Utilitária de suporte",
  MAP_CONTROL: "Controle de mapa",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="text-sm text-zinc-200">{value}</p>
    </div>
  );
}

/**
 * Contexto tático dinâmico exibido em toda tela de player: MAPA -> LADO ->
 * ESTRATÉGIA -> SETUP -> FUNÇÃO/ASSIGNMENT -> SKILL -> INSTRUÇÃO do momento
 * atual, resolvido por `usePlayerTacticalContext`. Nenhuma dessas telas
 * decide mais a função — ela vem só do `setup_assignment` do setup ativo.
 */
export function TacticalContextPanel({
  map,
  side,
  strategy,
  setup,
  assignment,
  skill,
  instruction,
  loading,
  error,
}: TacticalContextPanelProps) {
  const roleLabel = assignment?.role ?? (setup ? "SEM ASSIGNMENT PARA ESTE SETUP" : "AGUARDANDO SETUP");
  const tacticalAssignmentLabel = assignment?.tactical_assignment
    ? (TACTICAL_ASSIGNMENT_LABELS[assignment.tactical_assignment] ?? assignment.tactical_assignment)
    : "—";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Contexto tático {loading && "(atualizando...)"}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Mapa atual" value={map?.name ?? "—"} />
          <Field label="Lado" value={side ?? "—"} />
          <Field label="Estratégia" value={strategy?.name ?? "—"} />
          <Field label="Setup ativo" value={setup?.name ?? "AGUARDANDO"} />
        </div>

        {setup?.description && (
          <div className="mt-3 border-t border-zinc-800 pt-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Regra do setup
            </p>
            <p className="mt-1 whitespace-pre-line text-xs text-zinc-400">{setup.description}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Função atual</p>
        <p className="mt-1 text-lg font-bold tracking-wide text-emerald-300">{roleLabel}</p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Tactical assignment" value={tacticalAssignmentLabel} />
          <Field label="Posição" value={assignment?.position ?? "—"} />
          <Field label="Prioridade" value={assignment?.priority ?? "—"} />
        </div>
      </div>

      {skill && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Skill</p>
          <p className="mt-1 text-sm font-semibold text-zinc-100">{skill.name}</p>
          {skill.description && <p className="mt-1 text-sm text-zinc-400">{skill.description}</p>}
        </div>
      )}

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Instrução atual</p>

        {instruction ? (
          <div className="mt-2 flex flex-col gap-2">
            <p className="text-sm font-semibold text-zinc-100">{instruction.title}</p>
            <p className="text-sm text-zinc-300">{instruction.instruction}</p>

            <div className="mt-1 grid grid-cols-2 gap-3">
              <Field label="Objetivo" value={instruction.objective ?? "—"} />
              <Field label="Trigger" value={instruction.trigger ?? "—"} />
              <Field label="Próxima instrução" value={instruction.next_instruction ?? "—"} />
              <Field label="Utilitária" value={instruction.utility_type ?? "—"} />
              <Field label="Alvo da utilitária" value={instruction.utility_target ?? "—"} />
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-zinc-400">
            {setup ? "SEM INSTRUÇÃO PARA ESTE MOMENTO" : "AGUARDANDO DEFINIÇÃO DO IGL"}
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
