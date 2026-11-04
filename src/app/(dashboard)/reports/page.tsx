import { Header } from "@/components/layout/header";
import { getDashboardStats, getTickets, getCurrentUser } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import { Download } from "lucide-react";

export default async function ReportsPage() {
  const [stats, tickets, me] = await Promise.all([
    getDashboardStats(),
    getTickets(),
    getCurrentUser(),
  ]);

  const canExport = me && me.role !== "requester";

  const active = tickets.filter(
    (t) => !["resolved", "closed"].includes(t.status)
  );
  const byPriority = {
    critical: active.filter((t) => t.priority === "critical").length,
    high: active.filter((t) => t.priority === "high").length,
    medium: active.filter((t) => t.priority === "medium").length,
    low: active.filter((t) => t.priority === "low").length,
  };
  const byStatus = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const maxPriority = Math.max(...Object.values(byPriority), 1);
  const maxStatus = Math.max(...Object.values(byStatus), 1);

  const agentLoad = tickets
    .filter((t) => t.assigneeName && !["resolved", "closed"].includes(t.status))
    .reduce<Record<string, number>>((acc, t) => {
      const name = t.assigneeName!;
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});

  const agentRows = Object.entries(agentLoad).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <Header
        title="Reports & Analytics"
        description="Operational metrics from live ticket data"
      />

      {canExport && (
        <div className="flex justify-end px-6 pt-2">
          <a
            href="/api/export/tickets"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-600 hover:text-emerald-400"
          >
            <Download className="h-3.5 w-3.5" />
            Export tickets CSV
          </a>
        </div>
      )}

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 font-semibold">SLA Compliance</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-emerald-400">
              {stats.slaCompliance}%
            </span>
            <span className="mb-1 text-sm text-slate-500">resolved window</span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, stats.slaCompliance)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {stats.critical} critical open · {stats.unassigned} unassigned
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 font-semibold">Response & Throughput</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Avg first response</p>
              <p className="text-2xl font-bold">
                {stats.avgResponseTimeHours}
                <span className="text-sm font-normal text-slate-500">h</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Resolved today</p>
              <p className="text-2xl font-bold text-emerald-400">
                {stats.resolvedToday}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Open</p>
              <p className="text-2xl font-bold">{stats.openTickets}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">In progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-5 font-semibold">Active by priority</h3>
          <div className="space-y-3">
            {(
              [
                ["critical", byPriority.critical],
                ["high", byPriority.high],
                ["medium", byPriority.medium],
                ["low", byPriority.low],
              ] as const
            ).map(([label, count]) => (
              <div key={label} className="flex items-center gap-3">
                <Badge className={`w-20 justify-center ${getPriorityColor(label)}`}>
                  {label}
                </Badge>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500/80"
                    style={{
                      width: `${Math.round((count / maxPriority) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-sm tabular-nums text-slate-300">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-5 font-semibold">Volume by status</h3>
          <div className="space-y-3">
            {(
              [
                ["open", byStatus.open],
                ["in_progress", byStatus.in_progress],
                ["pending", byStatus.pending],
                ["resolved", byStatus.resolved],
                ["closed", byStatus.closed],
              ] as const
            ).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <Badge className={`min-w-[7rem] justify-center ${getStatusColor(status)}`}>
                  {getStatusLabel(status)}
                </Badge>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-500/70"
                    style={{
                      width: `${Math.round((count / maxStatus) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-sm tabular-nums text-slate-300">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Agent workload (active tickets)</h3>
          {agentRows.length === 0 ? (
            <p className="text-sm text-slate-500">No assigned active tickets.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agentRows.map(([name, count]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3"
                >
                  <span className="text-sm font-medium">{name}</span>
                  <span className="rounded-md bg-emerald-600/15 px-2 py-0.5 text-sm font-semibold text-emerald-400">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
