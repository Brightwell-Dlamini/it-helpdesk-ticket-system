# ApexDesk — IT Helpdesk & Ticket Management System

Modern IT Helpdesk with Supabase (Auth + Postgres + RLS), SLA engine, and clean operational UI.

## Quick Start (Mock Mode)

```bash
npm install
npm run dev
```

No database required — runs on rich mock data.

## Supabase Setup

1. Create a project at supabase.com
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy `.env.example` → `.env.local` and add your keys
4. Restart the app

## SLA Policies

| Priority  | Response | Resolution |
|-----------|----------|------------|
| Critical  | 1h       | 4h         |
| High      | 2h       | 8h         |
| Medium    | 4h       | 24h        |
| Low       | 8h       | 48h        |

Breach detection: `GET /api/cron/sla`

## Live Demo

https://it-helpdesk-ticket-system-ten.vercel.app

**ApexDesk** — Clear tickets. Controlled outcomes.
