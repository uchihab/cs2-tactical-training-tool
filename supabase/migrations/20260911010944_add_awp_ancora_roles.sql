-- ETAPA: expand players.role to include AWP and ANCORA.
-- Incremental change only — does not touch table structure or existing data.

alter table players drop constraint if exists players_role_check;

alter table players
  add constraint players_role_check
  check (role in ('IGL', 'ENTRY_1', 'ENTRY_2', 'SUPPORT', 'LURKER', 'AWP', 'ANCORA'));
