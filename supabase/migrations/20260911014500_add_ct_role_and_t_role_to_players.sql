-- ETAPA: introduce per-side player roles (ct_role / t_role) alongside the
-- existing `role` column. Additive only — does not touch table structure
-- otherwise, does not rename/drop `role` or its constraint, does not
-- convert or delete any existing row's data, and does not require any
-- value to be present on existing rows (both new columns are nullable).
--
-- Why: a player's in-game function depends on which side is being played.
-- The same player can be ANCHOR on CT and LURKER on T at the same time —
-- ANCHOR doesn't exist as a TRRole and LURKER doesn't exist as a CTRole, so
-- a single `role` column can never represent both. `role` is left in place
-- for now purely for backwards compatibility while the app migrates off of
-- it; it is no longer the source of truth for a player's function — see
-- src/types/player.ts (CTRole / TRRole / PlayerRecord).
--
-- CTRole (Counter-Terrorist side): IGL, AWPER, ANCHOR, RIFLER, SUPORTE, ROTATOR
-- TRRole (Terrorist side):        IGL, AWPER, ENTRY_FRAGGER, RIFLER, SUPORTE, LURKER
--
-- NOTE: this migration is independent of, and does not require,
-- 20260911013000_rename_player_roles_taxonomy.sql (also not yet applied).
-- That earlier migration renamed values *within* the single `role` column;
-- this one adds the two new columns that make `role` obsolete going
-- forward. Whether to still apply, adapt, or drop that earlier migration is
-- a separate decision, deliberately left open here.

alter table players add column if not exists ct_role text;
alter table players add column if not exists t_role text;

alter table players
  add constraint players_ct_role_check
  check (ct_role is null or ct_role in ('IGL', 'AWPER', 'ANCHOR', 'RIFLER', 'SUPORTE', 'ROTATOR'));

alter table players
  add constraint players_t_role_check
  check (t_role is null or t_role in ('IGL', 'AWPER', 'ENTRY_FRAGGER', 'RIFLER', 'SUPORTE', 'LURKER'));

-- Both columns are left null/unpopulated for existing rows on purpose — see
-- the companion, non-migration file
-- supabase/legacy_role_to_side_roles_notes.sql for suggested (never
-- automatically applied) statements to backfill them per player.
