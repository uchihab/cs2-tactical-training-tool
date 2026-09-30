-- ETAPA: `setup_instructions` — instrução de um setup_assignment para um
-- momento específico do round, permitindo que a instrução exibida mude
-- automaticamente conforme a fase avança (MOMENTO_1 -> MOMENTO_2 ->
-- MOMENTO_3), sem trocar de setup. Depende de `setup_assignments`
-- (20260911022000). Não altera nenhuma tabela existente.

create table if not exists setup_instructions (
  id uuid primary key default gen_random_uuid(),
  setup_assignment_id uuid not null references setup_assignments (id) on delete cascade,
  round_phase text not null,
  title text not null,
  instruction text not null,
  objective text,
  trigger text,
  next_instruction text,
  utility_type text,
  utility_target text,
  sequence_order integer,
  created_at timestamptz not null default now(),
  constraint setup_instructions_round_phase_check
    check (round_phase in ('MOMENTO_1', 'MOMENTO_2', 'MOMENTO_3'))
);

create index if not exists idx_setup_instructions_assignment_id
  on setup_instructions (setup_assignment_id);
create index if not exists idx_setup_instructions_assignment_phase
  on setup_instructions (setup_assignment_id, round_phase);
