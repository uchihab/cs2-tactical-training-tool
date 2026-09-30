import type { Side } from "./side";

/**
 * Estratégia cadastrada previamente por coach/IGL (linha de `strategies`).
 * Pertence a um mapa e a um lado (`side`) — ex: INFERNO/TR "DOMÍNIO BANANA +
 * EXEC B". Contém um ou mais `setups` (ver `setup.ts`).
 */
export interface StrategyRecord {
  id: string;
  map_id: string;
  side: Side;
  name: string;
  description: string | null;
  created_by: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
