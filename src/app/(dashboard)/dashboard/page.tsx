import { Header } from "@/components/layout/header";
import { dashboardStats, tickets } from "@/lib/mock-data";
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
  formatRelative,
} from "@/lib/utils";
import Link from "next/link";

const stats = [
  {
    label: "Open Tickets",
    value: dashboardStats.openTickets,
    icon: Ticket,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "In Progress",
    value: dashboardStats.inProgress,
    icon: Activity,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    label: "Resolved Today",
    value: dashboardStats.resolvedToday,
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "SLA Compliance",
    value: `${dashboardStats.slaCompliance}%`,
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    label: "Unassigned",
    value: dashboardStats.unassigned,
    icon: Users,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
  },
  {
    label: "Critical",
    value: dashboardStats.critical,
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
];

export default function DashboardPage() {
  const recent = tickets.slice(0, 5);

  return (
    <div>
      <Header
        title="Dashboard"
        description="Real-time overview of IT service operations"
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold">Recent Tickets</h2>
            <Link
              href="/tickets"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recent.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-800/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {ticket.number}
                    </span>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium">
                    {ticket.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {ticket.requesterName} · {formatRelative(ticket.createdAt)}
                  </p>
                </div>
                {ticket.assigneeName ? (
                  <span className="hidden text-xs text-slate-400 sm:block">
                    {ticket.assigneeName}
                  </span>
                ) : (
                  <span className="hidden text-xs text-amber-400/80 sm:block">
                    Unassigned
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
