-- SUGGESTION ONLY — this is NOT a migration and is never applied
-- automatically (it lives outside supabase/migrations/ on purpose).
--
-- Backfilling ct_role/t_role from the legacy single `role` column cannot be
-- done safely by a blind script: `role` only ever recorded ONE function per
-- player, and several legacy values aren't even valid on both sides — e.g.
-- a player whose `role` is 'ANCORA' plays Anchor on CT, but ANCHOR isn't a
-- valid TRRole, so their t_role has to be picked by a human who actually
-- knows what that player does on T. Same problem in reverse for 'LURKER'.
--
-- Real example from the product spec (Osoberbo): ct_role = 'ANCHOR',
-- t_role = 'LURKER'. Note this pair is NOT derivable from a single legacy
-- `role` value at all — someone had to know both sides independently. That
-- is exactly why this file is suggestions to run by hand, not a migration.
--
-- Values below assume the CURRENT live schema (the 2026-09-11 taxonomy
-- rename migration was never applied), i.e. role in
-- ('IGL', 'ENTRY_1', 'ENTRY_2', 'SUPPORT', 'LURKER', 'AWP', 'ANCORA').
-- Adjust if that migration is applied first.

-- 1. See what's there today.
select id, room_id, nickname, role, ct_role, t_role
from players
order by created_at;

-- 2. Legacy values that mean the same thing on both sides — reasonable
--    defaults, but still worth a human glance before running:
--      update players set ct_role = 'IGL',     t_role = 'IGL'
--        where role = 'IGL' and ct_role is null and t_role is null;
--      update players set ct_role = 'AWPER',   t_role = 'AWPER'
--        where role = 'AWP' and ct_role is null and t_role is null;
--      update players set ct_role = 'SUPORTE', t_role = 'SUPORTE'
--        where role = 'SUPPORT' and ct_role is null and t_role is null;

-- 3. Legacy values that are only valid on ONE side — the other side has NO
--    safe default and must be assigned per player by someone who knows how
--    that person actually plays, e.g.:

--    role = 'ANCORA' -> ct_role = 'ANCHOR' is a safe default; t_role is not:
--      update players set ct_role = 'ANCHOR'
--        where role = 'ANCORA' and ct_role is null;
--      update players set t_role = 'LURKER'
--        where id = '<uuid>';  -- only after confirming with the player/coach

--    role = 'LURKER' -> t_role = 'LURKER' is a safe default; ct_role is not:
--      update players set t_role = 'LURKER'
--        where role = 'LURKER' and t_role is null;
--      update players set ct_role = 'ANCHOR'  -- or 'ROTATOR', depends on the player
--        where id = '<uuid>';

--    role = 'ENTRY_1' / 'ENTRY_2' -> a t_role default is plausible
--    (ENTRY_FRAGGER / RIFLER respectively), but confirm; ct_role has no
--    entry-fragger equivalent and must be picked by hand:
--      update players set t_role = 'ENTRY_FRAGGER'
--        where role = 'ENTRY_1' and t_role is null;
--      update players set t_role = 'RIFLER'
--        where role = 'ENTRY_2' and t_role is null;
--      update players set ct_role = '<pick one: IGL/AWPER/ANCHOR/RIFLER/SUPORTE/ROTATOR>'
--        where id = '<uuid>';

-- 4. Only once every player has both ct_role and t_role filled in and
--    reviewed should the legacy `role` column and players_role_check be
--    dropped — in a later migration, not part of this file or of
--    20260911014500_add_ct_role_and_t_role_to_players.sql.
