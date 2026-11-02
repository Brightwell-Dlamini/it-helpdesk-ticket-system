-- Add first_response_at for measuring first-response SLA
alter table public.tickets
  add column if not exists first_response_at timestamptz;

comment on column public.tickets.first_response_at is
  'Timestamp of the first agent/admin response (comment or assignment)';
