-- ETAPA: `setups` — setup dentro de uma estratégia (ex: "3B INICIAL",
-- "2B PADRÃO", "STACK A", "DOMÍNIO BANANA"). Depende de `strategies`
-- (20260911020500). Não altera tabelas existentes.

create table if not exists setups (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references strategies (id) on delete cascade,
  name text not null,
  description text,
  priority integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint setups_strategy_name_unique unique (strategy_id, name)
);

create index if not exists idx_setups_strategy_id on setups (strategy_id);

create or replace function set_setups_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_setups_set_updated_at on setups;

create trigger trg_setups_set_updated_at
  before update on setups
  for each row
  execute function set_setups_updated_at();
