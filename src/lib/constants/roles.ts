import type { PlayerRole } from "@/types";

/**
 * Registro estático de cada função: rota própria e rótulo de exibição.
 * Base para a navegação e para a futura filtragem de instruções por função.
 */
export interface RoleRouteInfo {
  role: PlayerRole;
  path: string;
  label: string;
}

export const ROLE_ROUTES: readonly RoleRouteInfo[] = [
  { role: "IGL", path: "/igl", label: "IGL" },
  { role: "ENTRY_1", path: "/entry-1", label: "Entry 1" },
  { role: "ENTRY_2", path: "/entry-2", label: "Entry 2" },
  { role: "SUPPORT", path: "/support", label: "Support" },
  { role: "LURKER", path: "/lurker", label: "Lurker" },
] as const;
