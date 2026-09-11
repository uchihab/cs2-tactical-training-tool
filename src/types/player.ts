/**
 * Função tática de um jogador dentro do round.
 * Cada função corresponde a uma rota/tela própria da aplicação.
 */
export type PlayerRole =
  | "IGL"
  | "ENTRY_1"
  | "ENTRY_2"
  | "SUPPORT"
  | "LURKER"
  | "AWP"
  | "ANCORA";

export const PLAYER_ROLES: readonly PlayerRole[] = [
  "IGL",
  "ENTRY_1",
  "ENTRY_2",
  "SUPPORT",
  "LURKER",
  "AWP",
  "ANCORA",
] as const;

/**
 * Jogador conectado a uma sala (linha de `players`).
 */
export interface PlayerRecord {
  id: string;
  room_id: string;
  nickname: string | null;
  role: PlayerRole;
  connected: boolean;
  created_at: string;
}
