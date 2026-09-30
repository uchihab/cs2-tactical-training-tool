-- ETAPA: adiciona a seleção MAPA -> LADO -> ESTRATÉGIA -> SETUP ao estado
-- ativo do round. Aditivo apenas — todas as colunas são nullable, não toca
-- em `active_strategy` (fica como campo legado, texto livre, sem FK) nem em
-- nenhuma outra coluna/linha existente de `rounds`.
--
-- Depende de `maps` (20260911020000), `strategies` (20260911020500) e
-- `setups` (20260911021000).

alter table rounds add column if not exists map_id uuid references maps (id);
alter table rounds add column if not exists side text;
alter table rounds add column if not exists strategy_id uuid references strategies (id);
alter table rounds add column if not exists setup_id uuid references setups (id);

alter table rounds drop constraint if exists rounds_side_check;

alter table rounds
  add constraint rounds_side_check
  check (side is null or side in ('CT', 'TR'));

create index if not exists idx_rounds_map_id on rounds (map_id);
create index if not exists idx_rounds_strategy_id on rounds (strategy_id);
create index if not exists idx_rounds_setup_id on rounds (setup_id);
