-- ETAPA: joining a room no longer assigns a fixed operational role.
--
-- Player identity in a room is now just room_id + nickname (+ connected).
-- Operational role is resolved later, per round, from
-- MAP -> SIDE -> STRATEGY -> SETUP -> setup_assignments (see
-- src/types/setup-assignment.ts) — the same player can be ANCHOR in one CT
-- setup and LURKER in a different TR strategy without needing two player
-- rows. `players.role` is legacy: kept, still readable, but no longer
-- written by JOIN ROOM.
--
-- Incremental change only:
--   - does NOT drop the `role` column;
--   - does NOT touch/delete any existing row or its `role` value;
--   - does NOT expand the taxonomy of values `role` can hold.
--
-- 1. Allow role to be NULL, since new joins no longer set it. -------------
alter table players alter column role drop not null;

-- 2. Recreate players_role_check to accept NULL, on top of every role
--    value that has ever been legal in this column across this project's
--    history (original taxonomy from 20260911004656/20260911010944, plus
--    the renamed taxonomy from 20260911013000). Listing the union — instead
--    of only the latest taxonomy — keeps this migration correct regardless
--    of which of those earlier migrations have actually been applied to a
--    given database, without introducing any new value.
alter table players drop constraint if exists players_role_check;

alter table players
  add constraint players_role_check
  check (
    role is null
    or role in (
      -- original taxonomy
      'IGL', 'ENTRY_1', 'ENTRY_2', 'SUPPORT', 'LURKER', 'AWP', 'ANCORA',
      -- renamed taxonomy
      'AWPER', 'ANCHOR', 'ENTRY_FRAGGER', 'RIFLER', 'SUPORTE'
    )
  );
