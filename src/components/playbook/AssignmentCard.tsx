"use client";

import { useEffect, useState } from "react";
import { InstructionForm, type InstructionFormValues } from "./InstructionForm";
import { upsertAssignment, type AssignmentWithRelations } from "@/lib/supabase/playbook/assignments";
import { createInstruction, listInstructionsForAssignment } from "@/lib/supabase/playbook/instructions";
import { PRIORITY_LEVELS } from "@/lib/constants/skill-levels";
import { TACTICAL_ASSIGNMENTS } from "@/types";
import type { PlayerRecord, SetupInstructionRecord, SkillRecord, TacticalAssignment } from "@/types";

interface AssignmentCardProps {
  setupId: string;
  player: PlayerRecord;
  skills: readonly SkillRecord[];
  assignment: AssignmentWithRelations | null;
  onSaved: (assignment: AssignmentWithRelations) => void;
}

/**
 * Card de um player dentro do setup (Passo 4): role/tactical assignment/
 * skill/position/priority daquele player *neste* setup — não mexe em
 * `players.role`/`ct_role`/`t_role`. Uma vez salvo o assignment, revela a
 * área de instruções por momento do round (Passo 5).
 */
export function AssignmentCard({ setupId, player, skills, assignment, onSaved }: AssignmentCardProps) {
  const [role, setRole] = useState(assignment?.role ?? "");
  const [tacticalAssignment, setTacticalAssignment] = useState<TacticalAssignment | "">(
    assignment?.tactical_assignment ?? "",
  );
  const [skillId, setSkillId] = useState(assignment?.skill_id ?? "");
  const [position, setPosition] = useState(assignment?.position ?? "");
  const [priority, setPriority] = useState(assignment?.priority ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [instructions, setInstructions] = useState<SetupInstructionRecord[]>([]);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const [showInstructionForm, setShowInstructionForm] = useState(false);

  useEffect(() => {
    void (async () => {
      setRole(assignment?.role ?? "");
      setTacticalAssignment(assignment?.tactical_assignment ?? "");
      setSkillId(assignment?.skill_id ?? "");
      setPosition(assignment?.position ?? "");
      setPriority(assignment?.priority ?? "");
    })();
  }, [assignment]);

  useEffect(() => {
    void (async () => {
      if (!assignment?.id) {
        setInstructions([]);
        return;
      }
      setInstructionsLoading(true);
      listInstructionsForAssignment(assignment.id)
        .then(setInstructions)
        .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar instruções."))
        .finally(() => setInstructionsLoading(false));
    })();
  }, [assignment?.id]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const saved = await upsertAssignment({
        setup_id: setupId,
        player_id: player.id,
        role: role.trim() || null,
        tactical_assignment: tacticalAssignment || null,
        skill_id: skillId || null,
        position: position.trim() || null,
        priority: priority || null,
      });
      const skill = skills.find((candidate) => candidate.id === saved.skill_id) ?? null;
      onSaved({
        ...saved,
        players: { id: player.id, nickname: player.nickname },
        skills: skill ? { id: skill.id, name: skill.name } : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o assignment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddInstruction(values: InstructionFormValues) {
    if (!assignment?.id) return;
    const created = await createInstruction({ ...values, setup_assignment_id: assignment.id });
    setInstructions((prev) => [...prev, created]);
    setShowInstructionForm(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-sm font-semibold text-zinc-100">{player.nickname ?? "Sem nickname"}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Role neste setup
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Ex: ANCHOR"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Tactical assignment
          <select
            value={tacticalAssignment}
            onChange={(event) => setTacticalAssignment(event.target.value as TacticalAssignment | "")}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">—</option>
            {TACTICAL_ASSIGNMENTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Skill
          <select
            value={skillId}
            onChange={(event) => setSkillId(event.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">—</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Position
          <input
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder="Ex: Banana"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Priority
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
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
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-4 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-40"
        >
          {saving ? "SALVANDO..." : "SALVAR ASSIGNMENT"}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {assignment?.id && (
        <div className="mt-1 border-t border-zinc-800 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Instruções</p>
            <button
              type="button"
              onClick={() => setShowInstructionForm((current) => !current)}
              className="text-xs font-semibold text-emerald-400"
            >
              + ADICIONAR INSTRUÇÃO
            </button>
          </div>

          {instructionsLoading ? (
            <p className="mt-2 text-xs text-zinc-600">Carregando...</p>
          ) : instructions.length === 0 ? (
            <p className="mt-2 text-xs text-zinc-600">Nenhuma instrução cadastrada ainda.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {instructions.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300"
                >
                  <p className="font-semibold text-zinc-200">
                    {item.round_phase} — {item.title}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-zinc-400">{item.instruction}</p>
                  {item.objective && <p className="mt-1 text-zinc-500">Objetivo: {item.objective}</p>}
                  {item.trigger && <p className="text-zinc-500">Trigger: {item.trigger}</p>}
                  {item.next_instruction && (
                    <p className="text-zinc-500">Próxima instrução: {item.next_instruction}</p>
                  )}
                  {(item.utility_type || item.utility_target) && (
                    <p className="text-zinc-500">
                      Utilitária: {[item.utility_type, item.utility_target].filter(Boolean).join(" → ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {showInstructionForm && (
            <InstructionForm
              onSubmit={handleAddInstruction}
              onCancel={() => setShowInstructionForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
