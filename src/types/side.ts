/**
 * Lado da partida. Fonte de verdade para tudo que depende de lado
 * (estratégia, round ativo) — ver `player.ts` para o motivo pelo qual
 * `CTRole`/`TRRole` (e o legado `PlayerRole`) não bastam sozinhos: a função
 * de um jogador em um lado não é fixa, ela vem do `setup_assignment` do
 * setup ativo (ver `setup-assignment.ts`).
 */
export type Side = "CT" | "TR";

export const SIDES: readonly Side[] = ["CT", "TR"] as const;
