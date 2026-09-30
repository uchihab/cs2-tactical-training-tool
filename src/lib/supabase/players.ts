import { createClient } from "./client";
import type { PlayerRecord, TeamRoom } from "@/types";

/**
 * Procura uma sala ativa pelo código. O código é normalizado (uppercase,
 * sem espaços nas pontas) antes da busca.
 */
export async function findRoomByCode(code: string): Promise<TeamRoom> {
  const supabase = createClient();
  const normalizedCode = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from("team_rooms")
    .select()
    .eq("code", normalizedCode)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("FIND ROOM BY CODE ERROR", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error("Não foi possível buscar a sala. Tente novamente.");
  }

  if (!data) {
    throw new Error("Sala não encontrada.");
  }

  return data as TeamRoom;
}

export interface JoinRoomInput {
  code: string;
  nickname: string;
}

export interface JoinRoomResult {
  room: TeamRoom;
  player: PlayerRecord;
}

/**
 * Localiza a sala pelo código e conecta o jogador a ela. Entrar numa sala
 * representa só PLAYER IDENTITY + ROOM — não decide nem grava função
 * (AWPER, ANCHOR, LURKER, ENTRY, RIFLER, SUPORTE etc.). A função operacional
 * é resolvida depois, em tempo de partida, por MAP -> SIDE -> STRATEGY ->
 * SETUP -> `setup_assignments` (ver `setup-assignment.ts`) — por isso o
 * INSERT abaixo não envia `role`.
 *
 * Se já existir um player com o mesmo nickname (case-insensitive) nesta
 * sala, não cria duplicata: reconecta o player existente.
 */
export async function joinRoom({ code, nickname }: JoinRoomInput): Promise<JoinRoomResult> {
  const room = await findRoomByCode(code);
  const supabase = createClient();
  const normalizedNickname = nickname.trim();

  const { data: roomPlayers, error: listError } = await supabase
    .from("players")
    .select()
    .eq("room_id", room.id);

  if (listError) {
    console.error("JOIN ROOM ERROR", {
      message: listError.message,
      code: listError.code,
      details: listError.details,
      hint: listError.hint,
    });
    throw new Error("Não foi possível entrar na sala. Tente novamente.");
  }

  const existingPlayer = (roomPlayers as PlayerRecord[] | null)?.find(
    (player) => player.nickname?.trim().toLowerCase() === normalizedNickname.toLowerCase(),
  );

  if (existingPlayer) {
    const { data, error } = await supabase
      .from("players")
      .update({ connected: true })
      .eq("id", existingPlayer.id)
      .select()
      .single();

    if (error) {
      console.error("JOIN ROOM ERROR", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error("Não foi possível entrar na sala. Tente novamente.");
    }

    return { room, player: data as PlayerRecord };
  }

  const { data, error } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      nickname: normalizedNickname,
      connected: true,
    })
    .select()
    .single();

  if (error) {
    console.error("JOIN ROOM ERROR", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error("Não foi possível entrar na sala. Tente novamente.");
  }

  return { room, player: data as PlayerRecord };
}
