-- ETAPA: rename players.role to the new official player-role taxonomy and
-- retire LURKER as a principal role. Incremental change only — does not
-- touch table structure, does not drop/recreate `players`, and does not
-- delete any row.
--
-- New official taxonomy (PlayerRole, fixed per player):
--   IGL, AWPER, ANCHOR, ENTRY_FRAGGER, RIFLER, SUPORTE
--
-- LURKER is no longer a PlayerRole. Tactical responsibilities that can
-- change round-to-round (lurk, cut rotation, second entry, trade, hold,
-- execute, support utility, map control) are a separate, not-yet-persisted
-- concept — see TacticalAssignment in src/types/assignment.ts.
--
-- IMPORTANT — legacy `role = 'LURKER'` rows:
-- This migration does NOT decide what an existing LURKER player becomes —
-- that call depends on strategy context this migration doesn't have. It is
-- intentionally left for a human to resolve first. If any such rows remain
-- when this migration runs, step 2 below (new players_role_check) will
-- reject them and the whole migration fails atomically — no partial or
-- silently-wrong state is possible. See the companion, non-migration file
-- `supabase/lurker_role_review.sql` for a query to inspect them and example
-- statements to reassign or (only if explicitly confirmed as disposable
-- test data) delete them by id, before re-running this migration.

-- 1. Convert the known 1:1 legacy names ----------------------------------
update players set role = 'ENTRY_FRAGGER' where role = 'ENTRY_1';
update players set role = 'RIFLER' where role = 'ENTRY_2';
update players set role = 'SUPORTE' where role = 'SUPPORT';
update players set role = 'AWPER' where role = 'AWP';
update players set role = 'ANCHOR' where role = 'ANCORA';

-- 2. Replace the constraint with the new official taxonomy ---------------
alter table players drop constraint if exists players_role_check;

alter table players
  add constraint players_role_check
  check (role in ('IGL', 'AWPER', 'ANCHOR', 'ENTRY_FRAGGER', 'RIFLER', 'SUPORTE'));
