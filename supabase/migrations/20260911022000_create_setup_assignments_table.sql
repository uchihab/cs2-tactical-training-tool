-- ETAPA: `setup_assignments` — tabela CENTRAL da nova arquitetura. Liga um
-- player a um setup com a função/responsabilidade/skill que ele assume
-- *naquele* setup (ex: OSOBERBO em "3B INICIAL" (CT) = role ANCHOR,
-- tactical_assignment HOLD; em "DOMÍNIO BANANA" (TR) = role LURKER,
-- tactical_assignment CUT_ROTATION). É isso que substitui `ct_role`/`t_role`
-- como fonte de verdade da função exibida em tela — ver
-- src/types/setup-assignment.ts e o comentário atualizado em
-- src/types/player.ts.
--
-- Depende de `setups` (20260911021000), `players` (já existente) e `skills`
-- (20260911021500, FK opcional). Não altera nenhuma tabela existente.
--
-- `tactical_assignment` é restrito aos valores já definidos em
-- TacticalAssignment (src/types/assignment.ts) — conjunto fixo já
-- estabelecido no código, ainda não persistido em lugar nenhum antes desta
-- tabela. `role` fica livre (texto) de propósito: ao contrário de
-- ct_role/t_role, a função aqui não é mais um enum fixo por lado.

create table if not exists setup_assignments (
  id uuid primary key default gen_random_uuid(),
  setup_id uuid not null references setups (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  role text,
  tactical_assignment text,
  skill_id uuid references skills (id) on delete set null,
  position text,
  priority text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint setup_assignments_tactical_assignment_check
    check (
      tactical_assignment is null or tactical_assignment in (
        'LURK', 'CUT_ROTATION', 'SECOND_ENTRY', 'TRADE',
        'HOLD', 'EXECUTE', 'SUPPORT_UTILITY', 'MAP_CONTROL'
      )
    ),
  constraint setup_assignments_setup_player_unique unique (setup_id, player_id)
);

create index if not exists idx_setup_assignments_setup_id on setup_assignments (setup_id);
create index if not exists idx_setup_assignments_player_id on setup_assignments (player_id);

create or replace function set_setup_assignments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_setup_assignments_set_updated_at on setup_assignments;

create trigger trg_setup_assignments_set_updated_at
  before update on setup_assignments
  for each row
  execute function set_setup_assignments_updated_at();
