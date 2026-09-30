/**
 * Responsabilidade tática dentro de um round específico — ao contrário de
 * `PlayerRole` (fixa por jogador), um assignment pode ser reatribuído a
 * qualquer jogador a cada round, conforme a estratégia do IGL (ex: quem faz
 * lurk numa execução pode não ser quem faz lurk na próxima).
 *
 * Somente o tipo está preparado nesta etapa — ainda não é persistido em
 * nenhuma tabela nem atribuído por nenhuma tela.
 */
export type TacticalAssignment =
  | "LURK"
  | "CUT_ROTATION"
  | "SECOND_ENTRY"
  | "TRADE"
  | "HOLD"
  | "EXECUTE"
  | "SUPPORT_UTILITY"
  | "MAP_CONTROL";

export const TACTICAL_ASSIGNMENTS: readonly TacticalAssignment[] = [
  "LURK",
  "CUT_ROTATION",
  "SECOND_ENTRY",
  "TRADE",
  "HOLD",
  "EXECUTE",
  "SUPPORT_UTILITY",
  "MAP_CONTROL",
] as const;
