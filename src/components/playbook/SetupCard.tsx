"use client";

import Link from "next/link";
import type { SetupRecord } from "@/types";

interface SetupCardProps {
  setup: SetupRecord;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
  busy?: boolean;
}

/** Uma linha da lista de setups/variações (Passo 3). */
export function SetupCard({ setup, onEdit, onDuplicate, onToggleActive, busy }: SetupCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div>
        <p className="text-sm font-semibold text-zinc-100">{setup.name}</p>
        <p className="mt-1 text-xs text-zinc-500">
          Prioridade: {setup.priority ?? "—"}
          {!setup.active && (
            <span className="ml-2 rounded-full border border-amber-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-400">
              Desativado
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/playbook/setups/${setup.id}`}
          className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-3 py-2 text-xs font-semibold text-emerald-300"
        >
          CONFIGURAR PLAYERS
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
          {setup.active ? "DESATIVAR" : "REATIVAR"}
        </button>
      </div>
    </div>
  );
}
