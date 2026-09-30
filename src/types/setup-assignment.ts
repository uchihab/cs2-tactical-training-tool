import type { TacticalAssignment } from "./assignment";

/**
 * Tabela central da nova arquitetura (linha de `setup_assignments`): liga um
 * `player_id` a um `setup_id` com a função/responsabilidade/skill que esse
 * player assume *naquele* setup. Um mesmo player tem uma linha por setup em
 * que participa — ex: OSOBERBO em "3B INICIAL" (CT) é `role = "ANCHOR"`,
 * `tactical_assignment = "HOLD"`; em "DOMÍNIO BANANA" (TR) é `role =
 * "LURKER"`, `tactical_assignment = "CUT_ROTATION"`. Isso é o que substitui
 * `ct_role`/`t_role` como fonte de verdade da função exibida em tela.
 */
export interface SetupAssignmentRecord {
  id: string;
  setup_id: string;
  player_id: string;
  role: string | null;
  tactical_assignment: TacticalAssignment | null;
  skill_id: string | null;
  position: string | null;
  priority: string | null;
  created_at: string;
  updated_at: string;
}
