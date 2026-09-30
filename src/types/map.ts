/**
 * Mapa cadastrado (linha de `maps`). Topo da cadeia de fonte de verdade:
 * PLAYER -> MAP -> SIDE -> STRATEGY -> SETUP -> SETUP_ASSIGNMENT -> ROLE/SKILL.
 */
export interface MapRecord {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}
