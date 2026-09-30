"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import type { SetupRecord } from "@/types";

export interface SetupFormValues {
  name: string;
  description: string;
  priority: string;
  active: boolean;
}

interface SetupFormModalProps {
  open: boolean;
  setup?: SetupRecord | null;
  onClose: () => void;
  onSubmit: (values: SetupFormValues) => Promise<void>;
}

function toFormValues(setup: SetupRecord | null | undefined): SetupFormValues {
  return {
    name: setup?.name ?? "",
    description: setup?.description ?? "",
    priority: setup?.priority != null ? String(setup.priority) : "",
    active: setup?.active ?? true,
  };
}

/** Formulário de criação/edição de setup dentro de uma estratégia (Passo 3). */
export function SetupFormModal({ open, setup, onClose, onSubmit }: SetupFormModalProps) {
  const [values, setValues] = useState<SetupFormValues>(toFormValues(setup));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (open) {
        setValues(toFormValues(setup));
        setError(null);
      }
    })();
  }, [open, setup]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values.name.trim() || saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o setup.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={setup ? "Editar setup" : "Novo setup"} open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Nome
          <input
            value={values.name}
            onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Ex: MOMENTO 1 — DOMÍNIO E COLETA DE INFORMAÇÃO"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Descrição
          <span className="text-[10px] normal-case text-zinc-600">
            Referência temporal, objetivo e instruções macro cabem aqui.
          </span>
          <textarea
            value={values.description}
            onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
            rows={8}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Prioridade
          <input
            type="number"
            value={values.priority}
            onChange={(event) => setValues((prev) => ({ ...prev, priority: event.target.value }))}
            className="w-32 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
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
          {saving ? "SALVANDO..." : "SALVAR SETUP"}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </Modal>
  );
}
