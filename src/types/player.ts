/**
 * Função de um jogador no lado Counter-Terrorist. Alguns nomes existem só
 * neste lado (ex: `ANCHOR`, `ROTATOR`) — não têm equivalente em `TRRole`.
 */
export type CTRole = "IGL" | "AWPER" | "ANCHOR" | "RIFLER" | "SUPORTE" | "ROTATOR";

export const CT_ROLES: readonly CTRole[] = [
  "IGL",
  "AWPER",
  "ANCHOR",
  "RIFLER",
  "SUPORTE",
  "ROTATOR",
] as const;

/**
 * Função de um jogador no lado Terrorist. Alguns nomes existem só neste lado
 * (ex: `ENTRY_FRAGGER`, `LURKER`) — não têm equivalente em `CTRole`.
 */
export type TRRole = "IGL" | "AWPER" | "ENTRY_FRAGGER" | "RIFLER" | "SUPORTE" | "LURKER";

export const TR_ROLES: readonly TRRole[] = [
  "IGL",
  "AWPER",
  "ENTRY_FRAGGER",
  "RIFLER",
  "SUPORTE",
  "LURKER",
] as const;

/**
 * Função "clássica" de function fixa por jogador, independente de lado —
 * legado da modelagem anterior. A função de um jogador na prática depende
 * do lado (CT ou TR): o mesmo jogador pode ser `ANCHOR` no CT e `LURKER` no
 * TR, por exemplo, e `ANCHOR`/`LURKER` nem existem no lado oposto. `CTRole`
 * e `TRRole` acima são a fonte de verdade a partir de agora; este tipo (e a
 * coluna `role` que ele descreve) fica só por compatibilidade temporária —
 * ver a migration que introduz `ct_role`/`t_role`.
 */
export type PlayerRole = "IGL" | "AWPER" | "ANCHOR" | "ENTRY_FRAGGER" | "RIFLER" | "SUPORTE";

export const PLAYER_ROLES: readonly PlayerRole[] = [
  "IGL",
  "AWPER",
  "ANCHOR",
  "ENTRY_FRAGGER",
  "RIFLER",
  "SUPORTE",
] as const;

/**
 * Jogador conectado a uma sala (linha de `players`).
 *
 * `role`, `ct_role` e `t_role` são todos legado temporário agora: a função
 * de um player não é mais propriedade fixa dele, e sim algo resolvido em
 * tempo de partida a partir de MAP -> SIDE -> STRATEGY -> SETUP ->
 * `setup_assignments` (ver `setup-assignment.ts`) — o mesmo player pode ser
 * ANCHOR num setup CT e LURKER num setup TR diferente, e até assumir outra
 * função no mesmo lado se o IGL trocar de setup. `ct_role`/`t_role`
 * continuam existindo só por compatibilidade com telas que ainda não leem
 * de `setup_assignments`.
 */
export interface PlayerRecord {
  id: string;
  room_id: string;
  nickname: string | null;
  role: PlayerRole | null;
  ct_role: CTRole | null;
  t_role: TRRole | null;
  connected: boolean;
  created_at: string;
}
