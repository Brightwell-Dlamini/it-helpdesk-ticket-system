import { Header } from "@/components/layout/header";
import { DEFAULT_SLA_POLICIES } from "@/lib/sla";
import { Badge } from "@/components/ui/badge";
import { getPriorityColor } from "@/lib/utils";
import { Building2, Shield, BellOff, Server } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <Header
        title="Settings"
        description="System configuration, SLA policies, and operational preferences"
        showNewTicket={false}
      />
      <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-slate-500/15 p-2">
              <Building2 className="h-4 w-4 text-slate-300" />
            </div>
            <h3 className="font-semibold">Organisation</h3>
          </div>
          <p className="text-sm text-slate-400">
            Branding and default identity used across the helpdesk.
          </p>
          <div className="mt-4">
            <label className="text-xs font-medium text-slate-500">
              Organisation Name
            </label>
            <input
              defaultValue="Apex Organisation"
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-sm transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-amber-500/15 p-2">
              <Shield className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold">SLA Policies</h3>
              <p className="mt-0.5 text-sm text-slate-400">
                Resolution targets by priority for due dates, wall timers, and
                breach detection.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800/80 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Priority</th>
                  <th className="px-4 py-2.5 font-medium">First response</th>
                  <th className="px-4 py-2.5 font-medium">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {DEFAULT_SLA_POLICIES.map((policy) => (
                  <tr
                    key={policy.priority}
                    className="bg-slate-950/20 transition-colors hover:bg-slate-900/40"
                  >
                    <td className="px-4 py-3">
                      <Badge className={getPriorityColor(policy.priority)}>
                        {policy.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-300">
                      {policy.responseHours}h
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-300">
                      {policy.resolutionHours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Policies are defined in code and seeded in{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px]">
              sla_policies
            </code>
            .
          </p>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-slate-500/15 p-2">
              <BellOff className="h-4 w-4 text-slate-400" />
            </div>
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <p className="text-sm text-slate-400">
            Outbound email is disabled. Agents use the dashboard, wall board,
            and in-app toasts.
          </p>
          <div className="mt-4 space-y-2.5 text-sm">
            {[
              "Email on new ticket assignment — off",
              "SLA breach email alerts — off",
              "Daily digest — off",
            ].map((label) => (
              <label
                key={label}
                className="flex items-center gap-2.5 text-slate-500"
              >
                <input
                  type="checkbox"
                  disabled
                  className="rounded opacity-40"
                />
                {label}
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Inbound email-to-ticket remains available at{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px]">
              /api/email-ingest
            </code>
            .
          </p>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-sky-500/15 p-2">
              <Server className="h-4 w-4 text-sky-400" />
            </div>
            <h3 className="font-semibold">Operations</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-300">SLA cron</span>
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px]">
                /api/cron/sla
              </code>
              <span className="text-xs text-slate-600">daily 06:00 UTC</span>
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-300">Wall board</span>
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px]">
                /wall
              </code>
              <span className="text-xs text-slate-600">large-monitor display</span>
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-300">Health</span>
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px]">
                /api/health
              </code>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
