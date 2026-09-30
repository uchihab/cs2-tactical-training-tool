"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { SIDES } from "@/types";
import type { MapRecord, Side, StrategyRecord } from "@/types";

export interface StrategyFormValues {
  map_id: string;
  side: Side;
  name: string;
  description: string;
  created_by: string;
  active: boolean;
}

interface StrategyFormModalProps {
  open: boolean;
  maps: readonly MapRecord[];
  defaultMapId: string;
  defaultSide: Side;
  strategy?: StrategyRecord | null;
  onClose: () => void;
  onSubmit: (values: StrategyFormValues) => Promise<void>;
}

function toFormValues(
  strategy: StrategyRecord | null | undefined,
  defaultMapId: string,
  defaultSide: Side,
): StrategyFormValues {
  return {
    map_id: strategy?.map_id ?? defaultMapId,
    side: strategy?.side ?? defaultSide,
    name: strategy?.name ?? "",
    description: strategy?.description ?? "",
    created_by: strategy?.created_by ?? "",
    active: strategy?.active ?? true,
  };
}

/** Formulário de criação/edição de estratégia (Passo 2). */
export function StrategyFormModal({
  open,
  maps,
  defaultMapId,
  defaultSide,
  strategy,
  onClose,
  onSubmit,
}: StrategyFormModalProps) {
  const [values, setValues] = useState<StrategyFormValues>(
    toFormValues(strategy, defaultMapId, defaultSide),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (open) {
        setValues(toFormValues(strategy, defaultMapId, defaultSide));
        setError(null);
      }
    })();
  }, [open, strategy, defaultMapId, defaultSide]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values.name.trim() || !values.map_id || saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a estratégia.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={strategy ? "Editar estratégia" : "Nova estratégia"} open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Nome
          <input
            value={values.name}
            onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-500">
            Mapa
            <select
              value={values.map_id}
              onChange={(event) => setValues((prev) => ({ ...prev, map_id: event.target.value }))}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              {maps.map((map) => (
                <option key={map.id} value={map.id}>
                  {map.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-1 flex-col gap-1 text-xs text-zinc-500">
            Lado
            <select
              value={values.side}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, side: event.target.value as Side }))
              }
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              {SIDES.map((side) => (
                <option key={side} value={side}>
                  {side}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Descrição
          <textarea
            value={values.description}
            onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
            rows={4}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Criado por
          <input
            value={values.created_by}
            onChange={(event) => setValues((prev) => ({ ...prev, created_by: event.target.value }))}
            placeholder="Ex: IGL + COACH"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>

        <label className="flex items-center gap-2 text-xs text-zinc-500">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(event) => setValues((prev) => ({ ...prev, active: event.target.checked }))}
          />
          Ativo
        </label>

        <button
          type="submit"
          disabled={saving || !values.name.trim()}
          className="mt-2 rounded-lg border border-emerald-700 bg-emerald-900/40 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-40"
        >
          {saving ? "SALVANDO..." : "SALVAR ESTRATÉGIA"}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </Modal>
  );
}
