# ApexDesk — Your side checklist

Do these once. After that, the app uses live Auth + Postgres + Storage.

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. SQL Editor → paste and run `supabase/schema.sql`
3. SQL Editor → paste and run `supabase/attachments.sql` (Storage + attachments table)
4. SQL Editor → paste and run `supabase/knowledge.sql` (Knowledge Base + seed articles)
5. **Existing projects only:** if you already ran an older schema, also run:
   - `supabase/migration_first_response.sql` (adds `first_response_at`)
   - `supabase/knowledge.sql` (if knowledge table is missing)

## 2. Auth users

Authentication → Users → create at least:

| Email | Then set role in SQL |
|-------|----------------------|
| admin@yourorg.sz | `update profiles set role = 'admin' where email = 'admin@yourorg.sz';` |
| agent@yourorg.sz | `update profiles set role = 'agent' where email = 'agent@yourorg.sz';` |

Profiles are created by the `handle_new_user` trigger when users sign up. If a profile is missing, insert one manually matching `auth.users.id`.

Admins can also change roles from **Users & Roles** in the app.

## 3. Vercel environment variables

Project → Settings → Environment Variables (Production + Preview):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # optional; used by cron / email-ingest
CRON_SECRET=some-long-random-string
EMAIL_INGEST_SECRET=optional-for-inbound-email
```

Redeploy after saving.

## 4. Verify

- Open `/login` and sign in
- Open `/api/health` — should show `"supabase": true` / reachable
- Create a ticket and confirm it appears after refresh
- Change status / assign — activity feed should show system events
- Knowledge Base should list seed articles after running `knowledge.sql`
- Reports → Export tickets CSV (agents/admins)

## Optional

- Storage policies are defined in `attachments.sql` for the `ticket-attachments` bucket
- Cron: `vercel.json` hits `/api/cron/sla` daily (Hobby plan)
- Inbound email → ticket: point provider webhook at `POST /api/email-ingest` with Bearer `EMAIL_INGEST_SECRET`
- **Outbound email notifications are not implemented** (by design for this deployment)
