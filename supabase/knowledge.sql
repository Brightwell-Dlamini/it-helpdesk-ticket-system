-- Knowledge Base articles (run after schema.sql)

create table if not exists public.knowledge_articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  summary text not null default '',
  content text not null,
  category ticket_category not null default 'other',
  views integer not null default 0,
  helpful integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_articles_category_idx on public.knowledge_articles(category);

create trigger knowledge_articles_updated_at
  before update on public.knowledge_articles
  for each row execute function public.set_updated_at();

alter table public.knowledge_articles enable row level security;

create policy "Anyone authenticated can read knowledge"
  on public.knowledge_articles for select
  using (auth.uid() is not null);

create policy "Agents and admins can create knowledge"
  on public.knowledge_articles for insert
  with check (public.current_user_role() in ('admin', 'agent'));

create policy "Agents and admins can update knowledge"
  on public.knowledge_articles for update
  using (public.current_user_role() in ('admin', 'agent'));

create policy "Admins can delete knowledge"
  on public.knowledge_articles for delete
  using (public.current_user_role() = 'admin');

-- Seed a few starter articles (safe to re-run; only inserts if empty)
insert into public.knowledge_articles (title, summary, content, category, views, helpful)
select * from (values
  (
    'How to connect to the corporate VPN',
    'Step-by-step guide for connecting to the organisation VPN from Windows and macOS.',
    E'## Windows\n1. Open the company VPN client.\n2. Enter your AD credentials.\n3. Connect to the nearest gateway.\n\n## macOS\n1. Install the profile from Self Service.\n2. Use System Settings → Network → VPN.\n3. Authenticate with your work account.\n\nIf connection fails, try a different gateway or raise a Network ticket.',
    'network'::ticket_category,
    342,
    89
  ),
  (
    'Resetting your Microsoft 365 password',
    'Self-service password reset instructions and MFA recovery steps.',
    E'1. Go to https://passwordreset.microsoftonline.com\n2. Enter your work email.\n3. Complete MFA or security questions.\n4. Set a new password meeting complexity rules.\n\nIf you lost access to MFA, contact IT so we can reset methods on your account.',
    'access'::ticket_category,
    521,
    210
  ),
  (
    'Reporting a suspected phishing email',
    'What to do when you receive a suspicious message and how to report it safely.',
    E'Do **not** open attachments or click links.\n\n1. Select the message in Outlook.\n2. Use Report → Report phishing (or forward to security@yourorg.sz).\n3. Delete the message after reporting.\n4. If you already clicked a link, change your password immediately and open a Security ticket.',
    'security'::ticket_category,
    198,
    76
  )
) as v(title, summary, content, category, views, helpful)
where not exists (select 1 from public.knowledge_articles limit 1);
