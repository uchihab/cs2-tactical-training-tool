-- ETAPA: `skills` — perfil tático reutilizável (ex: ANCHOR_B, LURKER,
-- ENTRY_FRAGGER, AWPER_AGGRESSIVE), com `characteristics` em jsonb para
-- comportamento livre (agressividade, prioridade de trade/sobrevivência,
-- gatilhos de avanço/recuo, etc — ver src/types/skill.ts). Independente das
-- demais tabelas novas; não altera tabelas existentes.

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  description text,
  characteristics jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_skills_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_skills_set_updated_at on skills;

create trigger trg_skills_set_updated_at
  before update on skills
  for each row
  execute function set_skills_updated_at();
