import { Header } from "@/components/layout/header";
import { getDashboardStats, getTickets, getCurrentUser } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import { Download, Gauge, Timer, Users } from "lucide-react";

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
  const maxLoad = Math.max(...agentRows.map(([, c]) => c), 1);

  const priorityBarColor: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
  };

  return (
    <div>
      <Header
        title="Reports & Analytics"
        description="Operational metrics from live ticket data"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3 sm:px-6">
        <p className="text-xs text-slate-500">
          Snapshot based on current ticket queue
        </p>
        {canExport && (
          <a
            href="/api/export/tickets"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-600 hover:text-emerald-400"
          >
            <Download className="h-3.5 w-3.5" />
            Export tickets CSV
          </a>
        )}
      </div>

      <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/15 p-2">
              <Gauge className="h-4 w-4 text-emerald-400" />
            </div>
            <h3 className="font-semibold">SLA Compliance</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold tabular-nums tracking-tight text-emerald-400">
              {stats.slaCompliance}%
            </span>
            <span className="mb-1 text-sm text-slate-500">resolved window</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
              style={{ width: `${Math.min(100, stats.slaCompliance)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            <span className="text-red-400/90">{stats.critical} critical</span>
            {" · "}
            <span className="text-amber-400/90">
              {stats.unassigned} unassigned
            </span>
          </p>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-sky-500/15 p-2">
              <Timer className="h-4 w-4 text-sky-400" />
            </div>
            <h3 className="font-semibold">Response & Throughput</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Avg first response",
                value: (
                  <>
                    {stats.avgResponseTimeHours}
                    <span className="text-sm font-normal text-slate-500">h</span>
                  </>
                ),
              },
              {
                label: "Resolved today",
                value: (
                  <span className="text-emerald-400">{stats.resolvedToday}</span>
                ),
              },
              { label: "Open", value: stats.openTickets },
              { label: "In progress", value: stats.inProgress },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-3"
              >
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <h3 className="mb-5 font-semibold">Active by priority</h3>
          <div className="space-y-3.5">
            {(
              [
                ["critical", byPriority.critical],
                ["high", byPriority.high],
                ["medium", byPriority.medium],
                ["low", byPriority.low],
              ] as const
            ).map(([label, count]) => (
              <div key={label} className="flex items-center gap-3">
                <Badge
                  className={`w-20 justify-center ${getPriorityColor(label)}`}
                >
                  {label}
                </Badge>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${priorityBarColor[label]}`}
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

        <div className="card p-5 sm:p-6">
          <h3 className="mb-5 font-semibold">Volume by status</h3>
          <div className="space-y-3.5">
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
                <Badge
                  className={`min-w-[7rem] justify-center ${getStatusColor(status)}`}
                >
                  {getStatusLabel(status)}
                </Badge>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-500/80"
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

        <div className="card p-5 sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/15 p-2">
              <Users className="h-4 w-4 text-violet-400" />
            </div>
            <h3 className="font-semibold">Agent workload (active tickets)</h3>
          </div>
          {agentRows.length === 0 ? (
            <p className="text-sm text-slate-500">No assigned active tickets.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agentRows.map(([name, count]) => (
                <div
                  key={name}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-slate-100">
                      {name}
                    </span>
                    <span className="rounded-md bg-emerald-600/15 px-2 py-0.5 text-sm font-semibold tabular-nums text-emerald-400">
                      {count}
                    </span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-violet-500/70"
                      style={{
                        width: `${Math.round((count / maxLoad) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
