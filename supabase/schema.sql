-- ApexDesk Schema - Run in Supabase SQL Editor

create extension if not exists "uuid-ossp";

create type user_role as enum ('admin', 'agent', 'requester');
create type ticket_status as enum ('open', 'in_progress', 'pending', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high', 'critical');
create type ticket_category as enum ('hardware', 'software', 'network', 'access', 'email', 'security', 'other');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role user_role not null default 'requester',
  department text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default uuid_generate_v4(),
  number text not null unique,
  title text not null,
  description text not null,
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'medium',
  category ticket_category not null default 'other',
  requester_id uuid not null references public.profiles(id),
  assignee_id uuid references public.profiles(id),
  tags text[] default '{}',
  due_at timestamptz,
  resolved_at timestamptz,
  sla_breached boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  content text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.sla_policies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  priority ticket_priority not null,
  response_hours numeric not null,
  resolution_hours numeric not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index tickets_status_idx on public.tickets(status);
create index tickets_priority_idx on public.tickets(priority);
create index tickets_assignee_idx on public.tickets(assignee_id);
create index tickets_requester_idx on public.tickets(requester_id);
create index comments_ticket_id_idx on public.comments(ticket_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger tickets_updated_at before update on public.tickets for each row execute function public.set_updated_at();

create sequence public.ticket_number_seq start 1000;

create or replace function public.generate_ticket_number()
returns trigger as $$
begin
  if new.number is null or new.number = '' then
    new.number := 'HD-' || nextval('public.ticket_number_seq')::text;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tickets_number before insert on public.tickets for each row execute function public.generate_ticket_number();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'requester')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.sla_policies (name, priority, response_hours, resolution_hours) values
  ('Critical', 'critical', 1, 4),
  ('High', 'high', 2, 8),
  ('Medium', 'medium', 4, 24),
  ('Low', 'low', 8, 48);

alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.comments enable row level security;
alter table public.sla_policies enable row level security;

create or replace function public.current_user_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

create policy "Users can view all profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can update any profile" on public.profiles for update using (public.current_user_role() = 'admin');

create policy "Agents and admins can view all tickets" on public.tickets for select using (public.current_user_role() in ('admin', 'agent'));
create policy "Requesters can view own tickets" on public.tickets for select using (public.current_user_role() = 'requester' and requester_id = auth.uid());
create policy "Authenticated users can create tickets" on public.tickets for insert with check (auth.uid() is not null and requester_id = auth.uid());
create policy "Agents and admins can update tickets" on public.tickets for update using (public.current_user_role() in ('admin', 'agent'));

create policy "Agents and admins can view all comments" on public.comments for select using (public.current_user_role() in ('admin', 'agent'));
create policy "Requesters can view non-internal comments on own tickets" on public.comments for select using (
  public.current_user_role() = 'requester' and is_internal = false and exists (
    select 1 from public.tickets t where t.id = ticket_id and t.requester_id = auth.uid()
  )
);
create policy "Authenticated users can create comments" on public.comments for insert with check (auth.uid() is not null and author_id = auth.uid());

create policy "Anyone authenticated can read SLA policies" on public.sla_policies for select using (auth.uid() is not null);
create policy "Admins can manage SLA policies" on public.sla_policies for all using (public.current_user_role() = 'admin');
