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
  { role: "AWPER", path: "/awper", label: "AWPer" },
  { role: "ANCHOR", path: "/anchor", label: "Anchor" },
  { role: "ENTRY_FRAGGER", path: "/entry-fragger", label: "Entry-Fragger" },
  { role: "RIFLER", path: "/rifler", label: "Rifler" },
  { role: "SUPORTE", path: "/suporte", label: "Suporte" },
] as const;
