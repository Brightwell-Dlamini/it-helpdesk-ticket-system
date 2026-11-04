import { Header } from "@/components/layout/header";
import { getDashboardStats, getTickets } from "@/lib/data";
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Users,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
  formatRelative,
} from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const [dashboardStats, tickets] = await Promise.all([
    getDashboardStats(),
    getTickets(),
  ]);

  const stats = [
    {
      label: "Open Tickets",
      value: dashboardStats.openTickets,
      icon: Ticket,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
      accent: "from-blue-500/20",
      href: "/tickets",
    },
    {
      label: "In Progress",
      value: dashboardStats.inProgress,
      icon: Activity,
      color: "text-violet-400",
      bg: "bg-violet-500/15",
      accent: "from-violet-500/20",
      href: "/tickets",
    },
    {
      label: "Resolved Today",
      value: dashboardStats.resolvedToday,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      accent: "from-emerald-500/20",
      href: "/reports",
    },
    {
      label: "SLA Compliance",
      value: `${dashboardStats.slaCompliance}%`,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/15",
      accent: "from-amber-500/20",
      href: "/reports",
    },
    {
      label: "Unassigned",
      value: dashboardStats.unassigned,
      icon: Users,
      color: "text-slate-300",
      bg: "bg-slate-500/15",
      accent: "from-slate-500/20",
      href: "/tickets",
    },
    {
      label: "Critical",
      value: dashboardStats.critical,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/15",
      accent: "from-red-500/20",
      href: "/tickets",
    },
  ];

  const recent = tickets.slice(0, 6);

  return (
    <div>
      <Header
        title="Dashboard"
        description="Real-time overview of IT service operations"
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="stat-card group card-hover block"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.accent} to-transparent opacity-60`}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
            <div>
              <h2 className="font-semibold">Recent Tickets</h2>
              <p className="text-xs text-slate-500">Latest activity across the desk</p>
            </div>
            <Link
              href="/tickets"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80">
                <Inbox className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-300">No tickets yet</p>
              <p className="mt-1 text-xs text-slate-500">
                New requests will show up here in real time.
              </p>
              <Link
                href="/tickets/new"
                className="mt-4 text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                Create first ticket →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recent.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-800/30"
                >
                  <div
                    className={`h-9 w-1 shrink-0 rounded-full ${
                      ticket.priority === "critical"
                        ? "bg-red-500"
                        : ticket.priority === "high"
                          ? "bg-orange-500"
                          : ticket.priority === "medium"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium tabular-nums text-slate-500">
                        {ticket.number}
                      </span>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      {ticket.slaBreached && (
                        <Badge className="bg-red-500/15 text-red-400 border-red-500/30">
                          SLA
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-slate-100">
                      {ticket.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {ticket.requesterName} · {formatRelative(ticket.createdAt)}
                    </p>
                  </div>
                  {ticket.assigneeName ? (
                    <span className="hidden max-w-[8rem] truncate text-xs text-slate-400 sm:block">
                      {ticket.assigneeName}
                    </span>
                  ) : (
                    <span className="hidden text-xs text-amber-400/90 sm:block">
                      Unassigned
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
