/**
 * Setup dentro de uma estratégia (linha de `setups`) — ex: "3B INICIAL",
 * "2B PADRÃO", "STACK A", "DOMÍNIO BANANA". Quando o IGL ativa um setup em
 * partida, cada player recebe o `setup_assignment` correspondente ao seu
 * `player_id` dentro desse setup (ver `setup-assignment.ts`).
 */
export interface SetupRecord {
  id: string;
  strategy_id: string;
  name: string;
  description: string | null;
  priority: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
