-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Mirrors the old SQLite `store` table: a simple key/value table backing
-- every localStorage-style key the app uses (contacts, tasks, goals, etc.)

create table if not exists store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Lock it down: only the server (using the secret/service-role key, which
-- bypasses RLS entirely) can touch this table. The publishable/anon key
-- gets nothing, since the frontend never talks to Supabase directly —
-- it always goes through the Express API.
alter table store enable row level security;
