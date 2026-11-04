-- Run once if you already applied the previous schema.sql
-- Safe to re-run (IF NOT EXISTS pattern)

alter table public.tickets
  add column if not exists first_response_at timestamptz;
