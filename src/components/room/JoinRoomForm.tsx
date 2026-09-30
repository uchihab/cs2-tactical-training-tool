"use client";

import { useState, type FormEvent } from "react";
import { RoundTimer } from "@/components/round/RoundTimer";
import { TacticalContextPanel } from "@/components/room/TacticalContextPanel";
import { useRemoteRound } from "@/hooks/useRemoteRound";
import { usePlayerTacticalContext } from "@/hooks/usePlayerTacticalContext";
import { joinRoom, type JoinRoomResult } from "@/lib/supabase/players";

/**
 * Porta de entrada de uma sala. Entrar cria/reconecta só PLAYER IDENTITY +
 * ROOM (room_id + nickname + connected) — nenhuma função é gravada aqui. A
 * função operacional exibida depois de conectar vem só do setup ativo do
 * round, via `usePlayerTacticalContext` (MAP -> SIDE -> STRATEGY -> SETUP ->
 * SETUP_ASSIGNMENT). Antes de conectar, mostra o formulário de código +
 * nickname; depois, mostra o contexto tático e o cronômetro/fase do round da
 * sala, sincronizados via Supabase Realtime (somente leitura — nenhum
 * controle aqui).
 */
export function JoinRoomForm() {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<JoinRoomResult | null>(null);

  const canSubmit = code.trim().length > 0 && nickname.trim().length > 0;

  const {
    round,
    timeRemaining,
    status: roundStatus,
    phase,
    error: roundError,
  } = useRemoteRound(session?.room.id ?? null);

  const tacticalContext = usePlayerTacticalContext(
    session?.room.id ?? null,
    session?.player.id ?? null,
    round?.current_phase ?? null,
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);
    try {
      const result = await joinRoom({ code, nickname });
      setSession(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar na sala. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (session) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Sala:</p>
          <p className="text-lg font-bold tracking-widest text-zinc-100">{session.room.code}</p>

          <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">Player:</p>
          <p className="text-sm text-zinc-200">{session.player.nickname}</p>

          <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">Status:</p>
          <p className="text-sm font-semibold text-emerald-400">CONECTADO</p>
        </div>

        {roundError && <p className="text-xs text-red-400">{roundError}</p>}

        <RoundTimer timeRemaining={timeRemaining} status={roundStatus} phase={phase} />

        <TacticalContextPanel {...tacticalContext} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Entrar na sala
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Código da sala
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="EX: RLY85C"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm uppercase tracking-widest text-zinc-100 placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-600"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Nickname
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="Seu nickname"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="rounded-lg border border-emerald-700 bg-emerald-900/40 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-40"
        >
          {loading ? "ENTRANDO..." : "ENTRAR"}
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </div>
  );
}
