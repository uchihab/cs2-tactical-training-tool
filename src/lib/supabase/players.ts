import { createClient } from "./client";
import type { PlayerRecord, PlayerRole, TeamRoom } from "@/types";

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
  role: PlayerRole;
}

export interface JoinRoomResult {
  room: TeamRoom;
  player: PlayerRecord;
}

/**
 * Localiza a sala pelo código e cria o registro do jogador nela, já
 * conectado. Não impõe (ainda) uma única pessoa por role.
 */
export async function joinRoom({ code, nickname, role }: JoinRoomInput): Promise<JoinRoomResult> {
  const room = await findRoomByCode(code);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      nickname: nickname.trim(),
      role,
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
