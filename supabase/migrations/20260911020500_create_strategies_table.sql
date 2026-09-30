-- ETAPA: `strategies` — estratégia cadastrada por coach/IGL para um
-- mapa+lado (ex: INFERNO/TR "DOMÍNIO BANANA + EXEC B"). Depende de `maps`
-- (20260911020000). Não altera tabelas existentes.

create table if not exists strategies (
  id uuid primary key default gen_random_uuid(),
  map_id uuid not null references maps (id) on delete cascade,
  side text not null,
  name text not null,
  description text,
  created_by text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint strategies_side_check check (side in ('CT', 'TR')),
  constraint strategies_map_side_name_unique unique (map_id, side, name)
);

create index if not exists idx_strategies_map_id_side on strategies (map_id, side);

create or replace function set_strategies_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_strategies_set_updated_at on strategies;

create trigger trg_strategies_set_updated_at
  before update on strategies
  for each row
  execute function set_strategies_updated_at();
