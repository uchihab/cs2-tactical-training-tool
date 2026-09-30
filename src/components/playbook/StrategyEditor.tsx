"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlaybookHeader } from "./PlaybookHeader";
import { SetupCard } from "./SetupCard";
import { SetupFormModal, type SetupFormValues } from "./SetupFormModal";
import {
  createSetup,
  duplicateSetup,
  listSetupsByStrategy,
  updateSetup,
} from "@/lib/supabase/playbook/setups";
import { getStrategyById, type StrategyWithMap } from "@/lib/supabase/playbook/strategies";
import type { SetupRecord } from "@/types";

interface StrategyEditorProps {
  strategyId: string;
}

/** Editor de uma estratégia (Passo 3): dados da estratégia + setups/variações. */
export function StrategyEditor({ strategyId }: StrategyEditorProps) {
  const router = useRouter();

  const [strategy, setStrategy] = useState<StrategyWithMap | null>(null);
  const [setups, setSetups] = useState<SetupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busySetupId, setBusySetupId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSetup, setEditingSetup] = useState<SetupRecord | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getStrategyById(strategyId), listSetupsByStrategy(strategyId)])
      .then(([loadedStrategy, loadedSetups]) => {
        setStrategy(loadedStrategy);
        setSetups(loadedSetups);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar a estratégia."))
      .finally(() => setLoading(false));
  }, [strategyId]);

  useEffect(() => {
    void (async () => {
      reload();
    })();
  }, [reload]);

  function openCreateForm() {
    setEditingSetup(null);
    setFormOpen(true);
  }

  function openEditForm(setup: SetupRecord) {
    setEditingSetup(setup);
    setFormOpen(true);
  }

  async function handleSubmitForm(values: SetupFormValues) {
    const payload = {
      strategy_id: strategyId,
      name: values.name.trim(),
      description: values.description.trim() || null,
      priority: values.priority.trim() === "" ? null : Number(values.priority),
      active: values.active,
    };

    if (editingSetup) {
      await updateSetup(editingSetup.id, payload);
      setFormOpen(false);
      reload();
      return;
    }

    const created = await createSetup(payload);
    setFormOpen(false);
    router.push(`/playbook/setups/${created.id}`);
  }

  async function handleDuplicate(setup: SetupRecord) {
    setBusySetupId(setup.id);
    setError(null);
    try {
      await duplicateSetup(setup.id);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível duplicar o setup.");
    } finally {
      setBusySetupId(null);
    }
  }

  async function handleToggleActive(setup: SetupRecord) {
    setBusySetupId(setup.id);
    setError(null);
    try {
      await updateSetup(setup.id, { active: !setup.active });
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o setup.");
    } finally {
      setBusySetupId(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <PlaybookHeader />

      <Link href="/playbook" className="text-xs text-zinc-500 underline underline-offset-2">
        ← Voltar para estratégias
      </Link>

      {loading && <p className="text-xs text-zinc-500">Carregando...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {strategy && (
        <>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {strategy.maps?.name ?? "Mapa"} / {strategy.side}
            </p>
            <h2 className="mt-1 text-lg font-bold text-zinc-100">{strategy.name}</h2>
            {strategy.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">{strategy.description}</p>
            )}
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Setups / Variações
              </h3>
              <button
                type="button"
                onClick={openCreateForm}
                className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-4 py-2 text-xs font-semibold text-emerald-300"
              >
                + NOVO SETUP
              </button>
            </div>

            {setups.length === 0 ? (
              <p className="text-xs text-zinc-600">Nenhum setup cadastrado nesta estratégia ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {setups.map((setup) => (
                  <SetupCard
                    key={setup.id}
                    setup={setup}
                    busy={busySetupId === setup.id}
                    onEdit={() => openEditForm(setup)}
                    onDuplicate={() => handleDuplicate(setup)}
                    onToggleActive={() => handleToggleActive(setup)}
                  />
                ))}
              </div>
            )}
          </section>

          <SetupFormModal
            open={formOpen}
            setup={editingSetup}
            onClose={() => setFormOpen(false)}
            onSubmit={handleSubmitForm}
          />
        </>
      )}
    </main>
  );
}
