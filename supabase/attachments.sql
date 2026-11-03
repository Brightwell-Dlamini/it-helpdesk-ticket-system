-- Attachments + Storage (run after schema.sql)

create table if not exists public.attachments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  file_name text not null,
  file_size integer not null default 0,
  mime_type text not null default 'application/octet-stream',
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists attachments_ticket_id_idx on public.attachments(ticket_id);

alter table public.attachments enable row level security;

create policy "Agents and admins can view all attachments"
  on public.attachments for select
  using (public.current_user_role() in ('admin', 'agent'));

create policy "Requesters can view attachments on own tickets"
  on public.attachments for select
  using (
    public.current_user_role() = 'requester'
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_id and t.requester_id = auth.uid()
    )
  );

create policy "Authenticated users can upload attachments"
  on public.attachments for insert
  with check (auth.uid() is not null and uploaded_by = auth.uid());

create policy "Admins and agents can delete attachments"
  on public.attachments for delete
  using (public.current_user_role() in ('admin', 'agent'));

insert into storage.buckets (id, name, public)
values ('ticket-attachments', 'ticket-attachments', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload ticket files"
  on storage.objects for insert
  with check (
    bucket_id = 'ticket-attachments'
    and auth.uid() is not null
  );

create policy "Users can read ticket files they can access"
  on storage.objects for select
  using (
    bucket_id = 'ticket-attachments'
    and auth.uid() is not null
  );

create policy "Agents and admins can delete ticket files"
  on storage.objects for delete
  using (
    bucket_id = 'ticket-attachments'
    and auth.uid() is not null
  );
