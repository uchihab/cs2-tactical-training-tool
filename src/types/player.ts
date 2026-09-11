/**
 * Função tática de um jogador dentro do round.
 * Cada função corresponde a uma rota/tela própria da aplicação.
 */
export type PlayerRole = "IGL" | "ENTRY_1" | "ENTRY_2" | "SUPPORT" | "LURKER";

export const PLAYER_ROLES: readonly PlayerRole[] = [
  "IGL",
  "ENTRY_1",
  "ENTRY_2",
  "SUPPORT",
  "LURKER",
] as const;
