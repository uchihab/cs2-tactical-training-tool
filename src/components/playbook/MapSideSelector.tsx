"use client";

import { SIDES } from "@/types";
import type { MapRecord, Side } from "@/types";

interface MapSideSelectorProps {
  maps: readonly MapRecord[];
  mapId: string | null;
  onMapChange: (mapId: string) => void;
  side: Side;
  onSideChange: (side: Side) => void;
}

/** Seletores MAPA + LADO do topo de `/playbook` — primeiros dois passos do fluxo obrigatório. */
export function MapSideSelector({ maps, mapId, onMapChange, side, onSideChange }: MapSideSelectorProps) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
        Mapa
        <select
          value={mapId ?? ""}
          onChange={(event) => onMapChange(event.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        >
          {maps.length === 0 && <option value="">Nenhum mapa cadastrado</option>}
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1 text-xs uppercase tracking-wide text-zinc-500">
        Lado
        <div className="flex gap-2">
          {SIDES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSideChange(option)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                side === option
                  ? "border-emerald-700 bg-emerald-900/40 text-emerald-300"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
