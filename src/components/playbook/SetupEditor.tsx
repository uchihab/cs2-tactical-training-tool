"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlaybookHeader } from "./PlaybookHeader";
import { AssignmentCard } from "./AssignmentCard";
import { getSetupById, type SetupWithStrategy } from "@/lib/supabase/playbook/setups";
import { listAssignmentsForSetup, type AssignmentWithRelations } from "@/lib/supabase/playbook/assignments";
import { listActiveRooms, listPlayersByRoom } from "@/lib/supabase/playbook/rooms";
import { listSkills } from "@/lib/supabase/playbook/skills";
import type { PlayerRecord, SkillRecord, TeamRoom } from "@/types";

interface SetupEditorProps {
  setupId: string;
}

/** Editor de setup (Passo 4 + 5): cabeçalho do setup, players/assignments e instruções. */
export function SetupEditor({ setupId }: SetupEditorProps) {
  const [setup, setSetup] = useState<SetupWithStrategy | null>(null);
  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [rooms, setRooms] = useState<TeamRoom[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [assignments, setAssignments] = useState<Record<string, AssignmentWithRelations>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      Promise.all([
        getSetupById(setupId),
        listSkills(),
        listActiveRooms(),
        listAssignmentsForSetup(setupId),
      ])
        .then(([loadedSetup, loadedSkills, loadedRooms, loadedAssignments]) => {
          setSetup(loadedSetup);
          setSkills(loadedSkills);
          setRooms(loadedRooms);
          setRoomId((current) => current ?? loadedRooms[0]?.id ?? null);
          setAssignments(Object.fromEntries(loadedAssignments.map((item) => [item.player_id, item])));
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar o setup."))
        .finally(() => setLoading(false));
    })();
  }, [setupId]);

  useEffect(() => {
    void (async () => {
      if (!roomId) {
        setPlayers([]);
        return;
      }
      listPlayersByRoom(roomId)
        .then(setPlayers)
        .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar jogadores."));
    })();
  }, [roomId]);

  function handleAssignmentSaved(assignment: AssignmentWithRelations) {
    setAssignments((prev) => ({ ...prev, [assignment.player_id]: assignment }));
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <PlaybookHeader />

      {setup?.strategies && (
        <Link
          href={`/playbook/strategies/${setup.strategies.id}`}
          className="text-xs text-zinc-500 underline underline-offset-2"
        >
          ← Voltar para {setup.strategies.name}
        </Link>
      )}

      {loading && <p className="text-xs text-zinc-500">Carregando...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {setup && (
        <>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {setup.strategies?.maps?.name} / {setup.strategies?.side} / {setup.strategies?.name}
            </p>
            <h2 className="mt-1 text-lg font-bold text-zinc-100">{setup.name}</h2>
            <p className="mt-1 text-xs text-zinc-500">Prioridade: {setup.priority ?? "—"}</p>
            {setup.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">{setup.description}</p>
            )}
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Players / Assignments
              </h3>
              <label className="flex items-center gap-2 text-xs text-zinc-500">
                Sala
                <select
                  value={roomId ?? ""}
                  onChange={(event) => setRoomId(event.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                >
                  {rooms.length === 0 && <option value="">Nenhuma sala ativa</option>}
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.code}
                      {room.name ? ` — ${room.name}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {players.length === 0 ? (
              <p className="text-xs text-zinc-600">
                {roomId
                  ? "Nenhum jogador conectado nesta sala ainda."
                  : "Nenhuma sala ativa encontrada — crie uma sala na tela do IGL primeiro."}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {players.map((player) => (
                  <AssignmentCard
                    key={player.id}
                    setupId={setupId}
                    player={player}
                    skills={skills}
                    assignment={assignments[player.id] ?? null}
                    onSaved={handleAssignmentSaved}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
