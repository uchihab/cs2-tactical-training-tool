"use client";

import { useEffect, useRef, useState } from "react";
import { getActiveMaps } from "@/lib/supabase/playbook/maps";
import { listStrategies } from "@/lib/supabase/playbook/strategies";
import { getSetupById, listSetupsByStrategy } from "@/lib/supabase/playbook/setups";
import { activateRoundSetup } from "@/lib/supabase/rounds";
import { SIDES } from "@/types";
import type { MapRecord, RoundRecord, SetupRecord, Side, StrategyRecord } from "@/types";

interface TacticalSetupControlProps {
  round: RoundRecord;
}

/**
 * Seção "Contexto tático" do painel do IGL: MAPA -> LADO -> ESTRATÉGIA ->
 * SETUP, gravados de uma vez em `rounds` (um único UPDATE, via
 * `activateRoundSetup`) — sem tocar status/started_at/time_remaining/
 * current_phase, então funciona com o round RUNNING. Players conectados
 * recebem a troca de `setup_id` pelo mesmo Realtime que já sincroniza o
 * round (ver RELEVANT_FIELDS em useRoundState).
 */
export function TacticalSetupControl({ round }: TacticalSetupControlProps) {
  const seededRoundIdRef = useRef<string | null>(null);

  const [maps, setMaps] = useState<MapRecord[]>([]);
  const [strategies, setStrategies] = useState<StrategyRecord[]>([]);
  const [setups, setSetups] = useState<SetupRecord[]>([]);

  const [mapId, setMapId] = useState<string | null>(null);
  const [side, setSide] = useState<Side | null>(null);
  const [strategyId, setStrategyId] = useState<string | null>(null);
  const [setupId, setSetupId] = useState<string | null>(null);

  const [mapsLoading, setMapsLoading] = useState(false);
  const [strategiesLoading, setStrategiesLoading] = useState(false);
  const [setupsLoading, setSetupsLoading] = useState(false);

  const [activating, setActivating] = useState(false);
  const [activeSetup, setActiveSetup] = useState<SetupRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pré-seleciona o que já está ativo no round — uma vez por round (não
  // sobrescreve uma seleção em andamento do IGL a cada eco do Realtime).
  useEffect(() => {
    if (seededRoundIdRef.current === round.id) return;
    seededRoundIdRef.current = round.id;
    setMapId(round.map_id);
    setSide(round.side);
    setStrategyId(round.strategy_id);
    setSetupId(round.setup_id);
  }, [round.id, round.map_id, round.side, round.strategy_id, round.setup_id]);

  // Mapas: lista fixa, carregada uma vez ao montar — não depende de lado,
  // estratégia ou setup, e nada mais neste componente chama setMaps depois
  // (não é sobrescrita com [] após a carga inicial).
  useEffect(() => {
    let active = true;
    console.log("IGL_MAPS_LOADING");
    setMapsLoading(true);

    getActiveMaps()
      .then((result) => {
        console.log("IGL_MAPS_RESULT", result);
        if (active) setMaps(result);
      })
      .catch((err) => {
        console.error("IGL_MAPS_ERROR", err);
      })
      .finally(() => {
        if (active) setMapsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Estratégias: só depois de mapa + lado escolhidos, filtradas por active.
  useEffect(() => {
    if (!mapId || !side) {
      setStrategies([]);
      return;
    }

    let active = true;
    setStrategiesLoading(true);

    listStrategies(mapId, side)
      .then((result) => {
        if (active) setStrategies(result.filter((strategy) => strategy.active));
      })
      .catch((err) => {
        console.error("TACTICAL SETUP CONTROL LOAD STRATEGIES ERROR", err);
        if (active) setStrategies([]);
      })
      .finally(() => {
        if (active) setStrategiesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mapId, side]);

  // Setup ativo do round (nome + description/"regra do setup") — independente
  // do que o IGL está navegando nos selects acima. Reage a `round.setup_id`
  // (já sincronizado via Realtime), então reflete o estado real mesmo após
  // reload da página ou ativação feita a partir de outro dispositivo.
  useEffect(() => {
    if (!round.setup_id) {
      setActiveSetup(null);
      return;
    }

    let active = true;

    getSetupById(round.setup_id)
      .then((result) => {
        if (active) setActiveSetup(result);
      })
      .catch((err) => {
        console.error("TACTICAL SETUP CONTROL LOAD ACTIVE SETUP ERROR", err);
        if (active) setActiveSetup(null);
      });

    return () => {
      active = false;
    };
  }, [round.setup_id]);

  // Setups: só depois de estratégia escolhida, filtrados por active.
  useEffect(() => {
    if (!strategyId) {
      setSetups([]);
      return;
    }

    let active = true;
    setSetupsLoading(true);

    listSetupsByStrategy(strategyId)
      .then((result) => {
        if (active) setSetups(result.filter((setup) => setup.active));
      })
      .catch((err) => {
        console.error("TACTICAL SETUP CONTROL LOAD SETUPS ERROR", err);
        if (active) setSetups([]);
      })
      .finally(() => {
        if (active) setSetupsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [strategyId]);

  function handleMapChange(value: string) {
    setMapId(value || null);
    setStrategyId(null);
    setSetupId(null);
  }

  function handleSideChange(value: Side) {
    setSide(value);
    setStrategyId(null);
    setSetupId(null);
  }

  function handleStrategyChange(value: string) {
    setStrategyId(value || null);
    setSetupId(null);
  }

  function handleSetupChange(value: string) {
    setSetupId(value || null);
  }

  async function handleActivate() {
    if (!mapId || !side || !strategyId || !setupId || activating) return;

    setActivating(true);
    setError(null);

    try {
      await activateRoundSetup({ roundId: round.id, mapId, side, strategyId, setupId });
      // Feedback imediato, sem esperar o eco do Realtime em `round.setup_id`
      // (o efeito acima reconcilia de qualquer forma quando esse eco chegar).
      const justActivated = setups.find((setup) => setup.id === setupId) ?? null;
      if (justActivated) setActiveSetup(justActivated);
    } catch (err) {
      console.error("ACTIVATE ROUND SETUP ERROR", err);
      setError(err instanceof Error ? err.message : "Não foi possível ativar o setup.");
    } finally {
      setActivating(false);
    }
  }

  const canActivate = Boolean(mapId && side && strategyId && setupId) && !activating;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Contexto tático</p>

      <div className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Mapa
          <select
            value={mapId ?? ""}
            onChange={(event) => handleMapChange(event.target.value)}
            disabled={mapsLoading}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 disabled:opacity-40"
          >
            <option value="">Selecione...</option>
            {maps.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1 text-xs text-zinc-500">
          Lado
          <div className="grid grid-cols-2 gap-2">
            {SIDES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSideChange(option)}
                className={`rounded-lg border py-2 text-sm font-semibold ${
                  side === option
                    ? "border-emerald-700 bg-emerald-900/40 text-emerald-300"
                    : "border-zinc-700 bg-zinc-950 text-zinc-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Estratégia
          <select
            value={strategyId ?? ""}
            onChange={(event) => handleStrategyChange(event.target.value)}
            disabled={!mapId || !side || strategiesLoading}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 disabled:opacity-40"
          >
            <option value="">Selecione...</option>
            {strategies.map((strategy) => (
              <option key={strategy.id} value={strategy.id}>
                {strategy.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Setup
          <select
            value={setupId ?? ""}
            onChange={(event) => handleSetupChange(event.target.value)}
            disabled={!strategyId || setupsLoading}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 disabled:opacity-40"
          >
            <option value="">Selecione...</option>
            {setups.map((setup) => (
              <option key={setup.id} value={setup.id}>
                {setup.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleActivate}
          disabled={!canActivate}
          className="rounded-lg border border-emerald-700 bg-emerald-900/40 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-40"
        >
          {activating ? "ATIVANDO..." : "ATIVAR SETUP"}
        </button>

        {activeSetup && (
          <div className="text-xs text-emerald-400">
            <p className="uppercase tracking-wide">Setup ativo</p>
            <p className="text-sm font-semibold">{activeSetup.name}</p>

            {activeSetup.description && (
              <div className="mt-2 text-zinc-400">
                <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  Regra do setup
                </p>
                <p className="mt-1 whitespace-pre-line text-xs">{activeSetup.description}</p>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
