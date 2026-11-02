# ApexDesk — IT Helpdesk & Ticket Management System

A modern, production-ready IT Helpdesk and Ticket Management platform built for organisations that require clear visibility, SLA discipline, and role-based access control.

## Features

- **Dashboard** with real-time operational metrics (open tickets, SLA compliance, critical volume)
- **Ticket lifecycle management** — Open → In Progress → Pending → Resolved → Closed
- **Priority & category** classification with visual indicators
- **Role-based access** — Admin, Agent, Requester
- **Knowledge Base** for self-service resolution
- **Reports & Analytics** — SLA compliance, response times, volume by category
- **User management** view
- **Responsive, dark professional UI** optimised for operations teams

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** icons
- Ready for Supabase / Postgres / any backend

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/login
│   ├── (dashboard)/
│   │   ├── dashboard
│   │   ├── tickets
│   │   ├── knowledge
│   │   ├── reports
│   │   ├── users
│   │   └── settings
│   └── page.tsx
├── components/
│   ├── layout/
│   ├── ui/
│   └── ...
├── lib/
│   ├── mock-data.ts
│   └── utils.ts
└── types/
```

## Roadmap (Production Hardening)

- [ ] Supabase Auth + Row Level Security
- [ ] Real-time ticket updates
- [ ] Email-to-ticket ingestion
- [ ] SLA policy engine with escalation
- [ ] Full audit trail
- [ ] Customer / requester portal
- [ ] Advanced reporting & exports
- [ ] Mobile PWA enhancements

## Author

Built for Brightwell Dlamini / organisational use.

---

**ApexDesk** — Clear tickets. Controlled outcomes.
