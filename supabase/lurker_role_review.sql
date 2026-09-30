-- REVIEW ONLY — this is NOT a migration and is never applied automatically
-- (it lives outside supabase/migrations/ on purpose).
--
-- Run this manually, by hand, before applying
-- supabase/migrations/20260911013000_rename_player_roles_taxonomy.sql,
-- if — and only if — that migration fails because rows with role = 'LURKER'
-- still exist. That migration's new players_role_check no longer allows
-- 'LURKER', so any remaining row with that role blocks it.

-- 1. See exactly what is there.
select id, room_id, nickname, connected, created_at
from players
where role = 'LURKER'
order by created_at;

-- 2. For each row above, decide and run ONE of the following by hand —
--    never both, never automatically, never for a row you haven't looked at.

-- 2a. It was a real lurker player and should keep playing under one of the
--     6 official roles that fits them best (pick per row, don't script it):
--       update players set role = 'ENTRY_FRAGGER' where id = '<uuid>';
--       update players set role = 'RIFLER'        where id = '<uuid>';
--       update players set role = 'SUPORTE'       where id = '<uuid>';
--       update players set role = 'AWPER'         where id = '<uuid>';
--       update players set role = 'ANCHOR'        where id = '<uuid>';
--       update players set role = 'IGL'           where id = '<uuid>';

-- 2b. It is clearly disposable local/test data (e.g. from early manual
--     testing of this app, not a real team's data) and you have confirmed
--     that with whoever owns this database:
--       delete from players where id = '<uuid>';
