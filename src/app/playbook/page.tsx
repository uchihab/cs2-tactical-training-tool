"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapSideSelector } from "@/components/playbook/MapSideSelector";
import { PlaybookHeader } from "@/components/playbook/PlaybookHeader";
import { StrategyCard } from "@/components/playbook/StrategyCard";
import { StrategyFormModal, type StrategyFormValues } from "@/components/playbook/StrategyFormModal";
import { getActiveMaps } from "@/lib/supabase/playbook/maps";
import {
  createStrategy,
  duplicateStrategy,
  listStrategies,
  updateStrategy,
} from "@/lib/supabase/playbook/strategies";
import type { MapRecord, Side, StrategyRecord } from "@/types";

export default function PlaybookPage() {
  const router = useRouter();

  const [maps, setMaps] = useState<MapRecord[]>([]);
  const [mapId, setMapId] = useState<string | null>(null);
  const [side, setSide] = useState<Side>("CT");

  const [strategies, setStrategies] = useState<StrategyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyStrategyId, setBusyStrategyId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<StrategyRecord | null>(null);

  useEffect(() => {
    void (async () => {
      getActiveMaps()
        .then((loadedMaps) => {
          setMaps(loadedMaps);
          setMapId((current) => current ?? loadedMaps[0]?.id ?? null);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar mapas."));
    })();
  }, []);

  const reloadStrategies = useCallback(() => {
    if (!mapId) {
      setStrategies([]);
      return;
    }
    setLoading(true);
    setError(null);
    listStrategies(mapId, side)
      .then(setStrategies)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar estratégias."))
      .finally(() => setLoading(false));
  }, [mapId, side]);

  useEffect(() => {
    void (async () => {
      reloadStrategies();
    })();
  }, [reloadStrategies]);

  function openCreateForm() {
    setEditingStrategy(null);
    setFormOpen(true);
  }

  function openEditForm(strategy: StrategyRecord) {
    setEditingStrategy(strategy);
    setFormOpen(true);
  }

  async function handleSubmitForm(values: StrategyFormValues) {
    const payload = {
      map_id: values.map_id,
      side: values.side,
      name: values.name.trim(),
      description: values.description.trim() || null,
      created_by: values.created_by.trim() || null,
      active: values.active,
    };

    if (editingStrategy) {
      await updateStrategy(editingStrategy.id, payload);
      setFormOpen(false);
      reloadStrategies();
      return;
    }

    const created = await createStrategy(payload);
    setFormOpen(false);
    router.push(`/playbook/strategies/${created.id}`);
  }

  async function handleDuplicate(strategy: StrategyRecord) {
    setBusyStrategyId(strategy.id);
    setError(null);
    try {
      await duplicateStrategy(strategy.id);
      reloadStrategies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível duplicar a estratégia.");
    } finally {
      setBusyStrategyId(null);
    }
  }

  async function handleToggleActive(strategy: StrategyRecord) {
    setBusyStrategyId(strategy.id);
    setError(null);
    try {
      await updateStrategy(strategy.id, { active: !strategy.active });
      reloadStrategies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a estratégia.");
    } finally {
      setBusyStrategyId(null);
    }
  }

  const selectedMap = maps.find((map) => map.id === mapId) ?? null;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <PlaybookHeader />

      <MapSideSelector maps={maps} mapId={mapId} onMapChange={setMapId} side={side} onSideChange={setSide} />

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Estratégias</h2>
            {selectedMap && (
              <p className="text-xs text-zinc-600">
                {selectedMap.name} / {side}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            disabled={!mapId}
            className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-4 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-40"
          >
            + NOVA ESTRATÉGIA
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {loading ? (
          <p className="text-xs text-zinc-500">Carregando...</p>
        ) : strategies.length === 0 ? (
          <p className="text-xs text-zinc-600">
            Nenhuma estratégia cadastrada para este mapa/lado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                busy={busyStrategyId === strategy.id}
                onEdit={() => openEditForm(strategy)}
                onDuplicate={() => handleDuplicate(strategy)}
                onToggleActive={() => handleToggleActive(strategy)}
              />
            ))}
          </div>
        )}
      </section>

      {mapId && (
        <StrategyFormModal
          open={formOpen}
          maps={maps}
          defaultMapId={mapId}
          defaultSide={side}
          strategy={editingStrategy}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmitForm}
        />
      )}
    </main>
  );
}
