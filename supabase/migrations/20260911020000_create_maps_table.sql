-- ETAPA: nova arquitetura dinâmica de função (PLAYER -> MAP -> SIDE ->
-- STRATEGY -> SETUP -> SETUP_ASSIGNMENT -> ROLE/SKILL).
--
-- Esta migration só cria `maps`, o topo da cadeia. Não altera `players`,
-- `rounds` nem nenhuma tabela existente, e não apaga/migra nenhum dado.

create table if not exists maps (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_maps_active on maps (active);

-- RLS: não habilitado ainda, mesma justificativa da nota em
-- 20260911004656_create_core_schema.sql (sem auth nesta etapa).
