import { createClient } from "../client";
import { logPlaybookError } from "./errors";
import type { PlayerRecord, TeamRoom } from "@/types";

/**
 * Salas ativas, mais recente primeiro — usadas no editor de setup para
 * escolher de qual sala/equipe puxar os jogadores a atribuir.
 */
export async function listActiveRooms(): Promise<TeamRoom[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_rooms")
    .select()
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    logPlaybookError("LIST ACTIVE ROOMS ERROR", error);
    throw new Error("Não foi possível carregar as salas.");
  }

  return (data ?? []) as TeamRoom[];
}

/** Jogadores de uma sala, na ordem em que entraram. */
export async function listPlayersByRoom(roomId: string): Promise<PlayerRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("players")
    .select()
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) {
    logPlaybookError("LIST PLAYERS BY ROOM ERROR", error);
    throw new Error("Não foi possível carregar os jogadores da sala.");
  }

  return (data ?? []) as PlayerRecord[];
}
