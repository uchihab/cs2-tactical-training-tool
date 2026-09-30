"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { AGGRESSION_LEVELS, PRIORITY_LEVELS } from "@/lib/constants/skill-levels";
import type { SkillCharacteristics, SkillRecord } from "@/types";

export interface SkillFormValues {
  name: string;
  category: string;
  description: string;
  aggression: string;
  survivalPriority: string;
  tradePriority: string;
  rotationBehavior: string;
  utilityResponsibility: string;
}

interface SkillFormModalProps {
  open: boolean;
  skill?: SkillRecord | null;
  onClose: () => void;
  onSubmit: (values: SkillFormValues, restCharacteristics: SkillCharacteristics) => Promise<void>;
}

function toFormValues(skill: SkillRecord | null | undefined): SkillFormValues {
  const characteristics = skill?.characteristics ?? {};
  return {
    name: skill?.name ?? "",
    category: skill?.category ?? "",
    description: skill?.description ?? "",
    aggression: typeof characteristics.aggression === "string" ? characteristics.aggression : "",
    survivalPriority:
      typeof characteristics.survival_priority === "string" ? characteristics.survival_priority : "",
    tradePriority: typeof characteristics.trade_priority === "string" ? characteristics.trade_priority : "",
    rotationBehavior:
      typeof characteristics.rotation_behavior === "string" ? characteristics.rotation_behavior : "",
    utilityResponsibility:
      typeof characteristics.utility_responsibility === "string"
        ? characteristics.utility_responsibility
        : "",
  };
}

/**
 * `characteristics` guarda campos que a UI amigável não expõe (ex: as skills
 * do seed têm `execute_priority`, `adaptability`, etc). Preservamos esses
 * campos removendo apenas as chaves que este formulário edita, para não
 * perdê-los ao salvar.
 */
function restCharacteristics(skill: SkillRecord | null | undefined): SkillCharacteristics {
  const rest: SkillCharacteristics = { ...(skill?.characteristics ?? {}) };
  delete rest.aggression;
  delete rest.survival_priority;
  delete rest.trade_priority;
  delete rest.rotation_behavior;
  delete rest.utility_responsibility;
  return rest;
}

/** Formulário de criação/edição de skill, com campos amigáveis para `characteristics` (Passo 6). */
export function SkillFormModal({ open, skill, onClose, onSubmit }: SkillFormModalProps) {
  const [values, setValues] = useState<SkillFormValues>(toFormValues(skill));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (open) {
        setValues(toFormValues(skill));
        setError(null);
      }
    })();
  }, [open, skill]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values.name.trim() || saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSubmit(values, restCharacteristics(skill));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a skill.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={skill ? "Editar skill" : "Nova skill"} open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Nome
          <input
            value={values.name}
            onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Ex: ANCHOR_B"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Categoria
          <input
            value={values.category}
            onChange={(event) => setValues((prev) => ({ ...prev, category: event.target.value }))}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Descrição
          <textarea
            value={values.description}
            onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
            rows={2}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Agressividade
            <select
              value={values.aggression}
              onChange={(event) => setValues((prev) => ({ ...prev, aggression: event.target.value }))}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="">—</option>
              {AGGRESSION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Prioridade de sobrevivência
            <select
              value={values.survivalPriority}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, survivalPriority: event.target.value }))
              }
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="">—</option>
              {PRIORITY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Prioridade de trade
            <select
              value={values.tradePriority}
              onChange={(event) => setValues((prev) => ({ ...prev, tradePriority: event.target.value }))}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="">—</option>
              {PRIORITY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Rotação
            <input
              value={values.rotationBehavior}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, rotationBehavior: event.target.value }))
              }
              placeholder="Ex: HOLD_UNTIL_CALLED"
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2">
            Utilitária
            <input
              value={values.utilityResponsibility}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, utilityResponsibility: event.target.value }))
              }
              placeholder="Ex: sincroniza smoke + flash com o entry"
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving || !values.name.trim()}
          className="mt-2 rounded-lg border border-emerald-700 bg-emerald-900/40 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-40"
        >
          {saving ? "SALVANDO..." : "SALVAR SKILL"}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </Modal>
  );
}
