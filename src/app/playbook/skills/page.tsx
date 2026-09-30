"use client";

import { useCallback, useEffect, useState } from "react";
import { PlaybookHeader } from "@/components/playbook/PlaybookHeader";
import { SkillFormModal, type SkillFormValues } from "@/components/playbook/SkillFormModal";
import { createSkill, listSkills, updateSkill } from "@/lib/supabase/playbook/skills";
import type { SkillCharacteristics, SkillRecord } from "@/types";

function buildCharacteristics(
  values: SkillFormValues,
  rest: SkillCharacteristics,
): SkillCharacteristics {
  const characteristics: SkillCharacteristics = { ...rest };

  if (values.aggression) characteristics.aggression = values.aggression as SkillCharacteristics["aggression"];
  else delete characteristics.aggression;

  if (values.survivalPriority) {
    characteristics.survival_priority = values.survivalPriority as SkillCharacteristics["survival_priority"];
  } else delete characteristics.survival_priority;

  if (values.tradePriority) {
    characteristics.trade_priority = values.tradePriority as SkillCharacteristics["trade_priority"];
  } else delete characteristics.trade_priority;

  if (values.rotationBehavior.trim()) characteristics.rotation_behavior = values.rotationBehavior.trim();
  else delete characteristics.rotation_behavior;

  if (values.utilityResponsibility.trim()) {
    characteristics.utility_responsibility = values.utilityResponsibility.trim();
  } else delete characteristics.utility_responsibility;

  return characteristics;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillRecord | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    listSkills()
      .then(setSkills)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar skills."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void (async () => {
      reload();
    })();
  }, [reload]);

  function openCreateForm() {
    setEditingSkill(null);
    setFormOpen(true);
  }

  function openEditForm(skill: SkillRecord) {
    setEditingSkill(skill);
    setFormOpen(true);
  }

  async function handleSubmitForm(values: SkillFormValues, rest: SkillCharacteristics) {
    const payload = {
      name: values.name.trim(),
      category: values.category.trim() || null,
      description: values.description.trim() || null,
      characteristics: buildCharacteristics(values, rest),
    };

    if (editingSkill) {
      await updateSkill(editingSkill.id, payload);
    } else {
      await createSkill(payload);
    }

    setFormOpen(false);
    reload();
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <PlaybookHeader />

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Skills</h2>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-4 py-2 text-xs font-semibold text-emerald-300"
          >
            + NOVA SKILL
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {loading ? (
          <p className="text-xs text-zinc-500">Carregando...</p>
        ) : skills.length === 0 ? (
          <p className="text-xs text-zinc-600">Nenhuma skill cadastrada ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    {skill.name}
                    {skill.category && (
                      <span className="ml-2 text-xs font-normal uppercase tracking-wide text-zinc-500">
                        {skill.category}
                      </span>
                    )}
                  </p>
                  {skill.description && <p className="mt-1 text-xs text-zinc-500">{skill.description}</p>}
                  {skill.characteristics && (
                    <p className="mt-1 text-[11px] text-zinc-600">
                      {Object.entries(skill.characteristics)
                        .map(([key, value]) => `${key}: ${String(value)}`)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openEditForm(skill)}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300"
                >
                  EDITAR
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <SkillFormModal
        open={formOpen}
        skill={editingSkill}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitForm}
      />
    </main>
  );
}
