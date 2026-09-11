-- ETAPA 4B: base schema for team rooms, players, rounds and round events.
-- No RLS policies are created here (see notes at the end of this file).

create extension if not exists "pgcrypto";

-- 1. team_rooms ---------------------------------------------------------
-- A shared room connecting IGL, Entry 1, Entry 2, Support and Lurker.
create table if not exists team_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text,
  created_at timestamptz not null default now(),
  active boolean not null default true
);

create index if not exists idx_team_rooms_code on team_rooms (code);

-- 2. players -------------------------------------------------------------
-- One row per connected player/role inside a room.
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references team_rooms (id) on delete cascade,
  nickname text,
  role text not null,
  connected boolean not null default true,
  created_at timestamptz not null default now(),
  constraint players_role_check
    check (role in ('IGL', 'ENTRY_1', 'ENTRY_2', 'SUPPORT', 'LURKER'))
);

create index if not exists idx_players_room_id on players (room_id);

-- 3. rounds ---------------------------------------------------------------
-- The active/most recent round timer state for a room.
create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references team_rooms (id) on delete cascade,
  status text not null,
  started_at timestamptz,
  paused_at timestamptz,
  finished_at timestamptz,
  time_remaining integer not null default 115,
  current_phase text,
  active_strategy text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rounds_status_check
    check (status in ('IDLE', 'RUNNING', 'PAUSED', 'FINISHED')),
  constraint rounds_current_phase_check
    check (current_phase is null or current_phase in ('MOMENTO_1', 'MOMENTO_2', 'MOMENTO_3'))
);

create index if not exists idx_rounds_room_id on rounds (room_id);

-- Keep rounds.updated_at current on every UPDATE, regardless of caller.
create or replace function set_rounds_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_rounds_set_updated_at on rounds;

create trigger trg_rounds_set_updated_at
  before update on rounds
  for each row
  execute function set_rounds_updated_at();

-- 4. round_events -----------------------------------------------------------
-- Append-only log of decisions/actions taken during a round.
create table if not exists round_events (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds (id) on delete cascade,
  event_type text not null,
  event_value text,
  created_at timestamptz not null default now()
);

create index if not exists idx_round_events_round_id on round_events (round_id);

-- -----------------------------------------------------------------------
-- RLS NOTE (intentionally not implemented in this migration):
--
-- Row Level Security is NOT enabled on any of these tables yet. In Supabase,
-- a table with RLS disabled is fully readable/writable (all rows, all
-- operations) by any role that has schema privileges — which includes the
-- anon key used by the browser client. That is acceptable for this stage
-- (no auth yet), but before shipping beyond local/testing use, this will
-- need:
--
--   1. `alter table <table> enable row level security;` on all four tables.
--   2. Policies scoping access by room, e.g.:
--      - players/rounds/round_events readable/writable only by clients that
--        know (or are authenticated into) the parent team_rooms.code.
--      - team_rooms readable by anyone who has the code, but not listable.
--   3. Once auth (ETAPA future) exists, policies should key off
--      auth.uid() / a player-to-room mapping instead of the room code alone.
-- -----------------------------------------------------------------------
