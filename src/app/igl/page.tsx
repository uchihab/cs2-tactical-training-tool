"use client";

import { useEffect, useState } from "react";
import { RoleScreen } from "@/components/RoleScreen";
import { RoundTimer } from "@/components/round/RoundTimer";
import { TacticalSetupControl } from "@/components/igl/TacticalSetupControl";
import { useIglRoundController } from "@/hooks/useIglRoundController";
import { checkSupabaseHealth, type SupabaseHealthResult } from "@/lib/supabase/health";
import { createTeamRoomWithInitialRound } from "@/lib/supabase/rooms";
import type { TeamRoom } from "@/types";

const SECTIONS = [
  "Estratégia ativa",
  "Jogadores conectados",
  "Utilitárias restantes",
  "Informações coletadas",
  "Controle de mapa",
  "Árvore de decisão",
] as const;

const EXEC_ACTIONS = ["EXEC A", "EXEC B", "HOLD", "FAKE", "ROTATE", "CANCEL"] as const;

export default function IglPage() {
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthResult | null>(null);

  // TEMPORARY (ETAPA 4A): remove once Supabase integration is stable.
  useEffect(() => {
    let active = true;
    checkSupabaseHealth().then((result) => {
      if (active) setSupabaseHealth(result);
    });
    return () => {
      active = false;
    };
  }, []);

  const [room, setRoom] = useState<TeamRoom | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  async function handleCreateRoom() {
    setRoomLoading(true);
    setRoomError(null);
    try {
      const { room: createdRoom } = await createTeamRoomWithInitialRound();
      setRoom(createdRoom);
    } catch {
      setRoomError("Não foi possível criar a sala. Tente novamente.");
    } finally {
      setRoomLoading(false);
    }
  }

  const {
    round,
    timeRemaining,
    status,
    phase,
    loading: roundLoading,
    error: roundError,
    syncMessage,
    isPending,
    startRound,
    pauseRound,
    resumeRound,
    resetRound,
  } = useIglRoundController(room?.id ?? null);

  return (
    <RoleScreen roleLabel="IGL" sections={SECTIONS}>
      <div className="text-xs text-zinc-500">
        SUPABASE:{" "}
        {supabaseHealth === null ? (
          <span className="text-zinc-400">CHECKING...</span>
        ) : supabaseHealth.status === "connected" ? (
          <span className="text-emerald-400">CONNECTED</span>
        ) : (
          <span className="text-red-400">CONNECTION ERROR</span>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Sala da equipe
        </p>

        {room ? (
          <div className="mt-2 flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Código:</p>
            <p className="text-2xl font-bold tracking-widest text-zinc-100">{room.code}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">Status:</p>
            <p className="text-sm font-semibold text-emerald-400">
              {room.active ? "ATIVA" : "INATIVA"}
            </p>
            <p className="mt-2 text-[10px] text-zinc-600">ID: {room.id}</p>
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCreateRoom}
              disabled={roomLoading}
              className="rounded-lg border border-emerald-700 bg-emerald-900/40 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-40"
            >
              {roomLoading ? "CRIANDO..." : "CRIAR SALA"}
            </button>
            {roomError && <p className="text-xs text-red-400">{roomError}</p>}
          </div>
        )}
      </div>

      {room && (
        <>
          {roundError && <p className="text-xs text-red-400">{roundError}</p>}
          {syncMessage && <p className="text-xs text-amber-400">{syncMessage}</p>}

          <RoundTimer timeRemaining={timeRemaining} status={status} phase={phase} />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={startRound}
              disabled={roundLoading || isPending || status !== "IDLE"}
              className="rounded-lg border border-emerald-700 bg-emerald-900/40 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-40"
            >
              START ROUND
            </button>
            <button
              type="button"
              onClick={pauseRound}
              disabled={roundLoading || isPending || status !== "RUNNING"}
              className="rounded-lg border border-zinc-700 bg-zinc-900 py-3 text-sm font-semibold text-zinc-300 disabled:opacity-40"
            >
              PAUSE
            </button>
            <button
              type="button"
              onClick={resumeRound}
              disabled={roundLoading || isPending || status !== "PAUSED"}
              className="rounded-lg border border-zinc-700 bg-zinc-900 py-3 text-sm font-semibold text-zinc-300 disabled:opacity-40"
            >
              RESUME
            </button>
            <button
              type="button"
              onClick={resetRound}
              disabled={roundLoading || isPending || status === "IDLE"}
              className="rounded-lg border border-zinc-700 bg-zinc-900 py-3 text-sm font-semibold text-zinc-300 disabled:opacity-40"
            >
              RESET
            </button>
          </div>

          {round && <TacticalSetupControl round={round} />}
        </>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        {EXEC_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            disabled
            className="rounded-lg border border-zinc-700 bg-zinc-900 py-3 text-sm font-semibold text-zinc-400 disabled:opacity-60"
          >
            {action}
          </button>
        ))}
      </div>
    </RoleScreen>
  );
}
