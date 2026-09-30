"use client";

import Link from "next/link";
import type { StrategyRecord } from "@/types";

interface StrategyCardProps {
  strategy: StrategyRecord;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
  busy?: boolean;
}

/** Uma linha da lista de estratégias (Passo 1): ABRIR / EDITAR / DUPLICAR / DESATIVAR. */
export function StrategyCard({ strategy, onEdit, onDuplicate, onToggleActive, busy }: StrategyCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div>
        <p className="text-sm font-semibold text-zinc-100">{strategy.name}</p>
        {strategy.description && (
          <p className="mt-1 max-w-xl text-xs text-zinc-500">
            {strategy.description.split("\n")[0]}
          </p>
        )}
        {!strategy.active && (
          <span className="mt-1 inline-block rounded-full border border-amber-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-400">
            Desativada
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/playbook/strategies/${strategy.id}`}
          className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-3 py-2 text-xs font-semibold text-emerald-300"
        >
          ABRIR
        </Link>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300"
        >
          EDITAR
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          disabled={busy}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 disabled:opacity-40"
        >
          DUPLICAR
        </button>
        <button
          type="button"
          onClick={onToggleActive}
          disabled={busy}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 disabled:opacity-40"
        >
          {strategy.active ? "DESATIVAR" : "REATIVAR"}
        </button>
      </div>
    </div>
  );
}
