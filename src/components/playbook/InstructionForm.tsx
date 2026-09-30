"use client";

import { useState, type FormEvent } from "react";
import type { RoundPhase } from "@/types";

export interface InstructionFormValues {
  round_phase: RoundPhase;
  title: string;
  instruction: string;
  objective: string | null;
  trigger: string | null;
  next_instruction: string | null;
  utility_type: string | null;
  utility_target: string | null;
  sequence_order: number | null;
}

interface InstructionFormProps {
  onSubmit: (values: InstructionFormValues) => Promise<void>;
  onCancel: () => void;
}

/** Formulário "+ ADICIONAR INSTRUÇÃO" de um assignment (Passo 5). */
export function InstructionForm({ onSubmit, onCancel }: InstructionFormProps) {
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("MOMENTO_1");
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [objective, setObjective] = useState("");
  const [trigger, setTrigger] = useState("");
  const [nextInstruction, setNextInstruction] = useState("");
  const [utilityType, setUtilityType] = useState("");
  const [utilityTarget, setUtilityTarget] = useState("");
  const [sequenceOrder, setSequenceOrder] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !instruction.trim() || saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        round_phase: roundPhase,
        title: title.trim(),
        instruction: instruction.trim(),
        objective: objective.trim() || null,
        trigger: trigger.trim() || null,
        next_instruction: nextInstruction.trim() || null,
        utility_type: utilityType.trim() || null,
        utility_target: utilityTarget.trim() || null,
        sequence_order: sequenceOrder.trim() === "" ? null : Number(sequenceOrder),
      });
      setTitle("");
      setInstruction("");
      setObjective("");
      setTrigger("");
      setNextInstruction("");
      setUtilityType("");
      setUtilityTarget("");
      setSequenceOrder("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a instrução.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Momento
          <select
            value={roundPhase}
            onChange={(event) => setRoundPhase(event.target.value as RoundPhase)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="MOMENTO_1">MOMENTO_1</option>
            <option value="MOMENTO_2">MOMENTO_2</option>
            <option value="MOMENTO_3">MOMENTO_3</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Ordem
          <input
            type="number"
            value={sequenceOrder}
            onChange={(event) => setSequenceOrder(event.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Título
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Instrução
        <textarea
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          rows={3}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Objetivo
        <input
          value={objective}
          onChange={(event) => setObjective(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Trigger
        <input
          value={trigger}
          onChange={(event) => setTrigger(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Próxima instrução
        <input
          value={nextInstruction}
          onChange={(event) => setNextInstruction(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Utility type
          <input
            value={utilityType}
            onChange={(event) => setUtilityType(event.target.value)}
            placeholder="Ex: MOLOTOV"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Utility target
          <input
            value={utilityTarget}
            onChange={(event) => setUtilityTarget(event.target.value)}
            placeholder="Ex: Tripla"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-4 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-40"
        >
          {saving ? "SALVANDO..." : "SALVAR INSTRUÇÃO"}
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-zinc-500 underline underline-offset-2">
          Cancelar
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
