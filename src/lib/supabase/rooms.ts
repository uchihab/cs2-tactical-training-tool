import { createClient } from "./client";
import type { RoundRecord, TeamRoom } from "@/types";

const ROOM_CODE_LENGTH = 6;
// Sem O, 0, I, 1 — evita ambiguidade visual ao digitar/ler o código.
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_CODE_ATTEMPTS = 5;
const UNIQUE_VIOLATION = "23505";

function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Cria uma sala com um código curto único. Em caso de colisão de código
 * (raro), tenta novamente com um novo código antes de desistir.
 */
export async function createTeamRoom(): Promise<TeamRoom> {
  const supabase = createClient();

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const { data, error } = await supabase
      .from("team_rooms")
      .insert({ code: generateRoomCode() })
      .select()
      .single();

    if (!error) {
      return data as TeamRoom;
    }

    if (error.code !== UNIQUE_VIOLATION) {
      console.error("CREATE TEAM ROOM ERROR", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(error.message);
    }
  }

  throw new Error("Não foi possível gerar um código de sala único. Tente novamente.");
}

/**
 * Cria o round inicial (IDLE, Momento 1, 1:55) associado a uma sala.
 */
export async function createInitialRound(roomId: string): Promise<RoundRecord> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("rounds")
    .insert({
      room_id: roomId,
      status: "IDLE",
      time_remaining: 115,
      current_phase: "MOMENTO_1",
      active_strategy: null,
      started_at: null,
      paused_at: null,
      finished_at: null,
    })
    .select()
    .single();

  if (error) {
    console.error("CREATE INITIAL ROUND ERROR", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(error.message);
  }

  return data as RoundRecord;
}

export interface CreateTeamRoomWithInitialRoundResult {
  room: TeamRoom;
  initialRound: RoundRecord;
}

/**
 * Cria a sala e, em seguida, o round inicial associado a ela.
 * Se a criação do round falhar, a sala recém-criada é removida para não
 * deixar uma sala órfã sem round.
 */
export async function createTeamRoomWithInitialRound(): Promise<CreateTeamRoomWithInitialRoundResult> {
  const room = await createTeamRoom();

  try {
    const initialRound = await createInitialRound(room.id);
    return { room, initialRound };
  } catch (error) {
    const supabase = createClient();
    await supabase.from("team_rooms").delete().eq("id", room.id);
    throw error;
  }
}
