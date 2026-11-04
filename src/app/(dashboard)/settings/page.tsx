import { Header } from "@/components/layout/header";
import { DEFAULT_SLA_POLICIES } from "@/lib/sla";
import { Badge } from "@/components/ui/badge";
import { getPriorityColor } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div>
      <Header
        title="Settings"
        description="System configuration, SLA policies, and operational preferences"
      />
      <div className="max-w-3xl space-y-6 p-6">
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="font-semibold">Organisation</h3>
          <p className="mt-1 text-sm text-slate-400">
            Branding and default identity used across the helpdesk.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500">
                Organisation Name
              </label>
              <input
                defaultValue="Apex Organisation"
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">SLA Policies</h3>
              <p className="mt-1 text-sm text-slate-400">
                Resolution targets by priority. Used for due dates, wall board
                timers, and breach detection (cron daily).
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Priority</th>
                  <th className="px-4 py-2.5 font-medium">First response</th>
                  <th className="px-4 py-2.5 font-medium">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {DEFAULT_SLA_POLICIES.map((policy) => (
                  <tr key={policy.priority} className="bg-slate-950/30">
                    <td className="px-4 py-3">
                      <Badge className={getPriorityColor(policy.priority)}>
                        {policy.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {policy.responseHours}h
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {policy.resolutionHours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Policies are defined in code and seeded in Supabase{" "}
            <code className="rounded bg-slate-800 px-1">sla_policies</code>.
            Adjust via SQL or a future admin editor.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="font-semibold">Notifications</h3>
          <p className="mt-1 text-sm text-slate-400">
            Outbound email notifications are intentionally disabled for this
            deployment. Agents rely on the live dashboard, wall board, and
            in-app toasts.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-center gap-2 text-slate-500">
              <input type="checkbox" disabled className="rounded opacity-50" />
              Email on new ticket assignment — off
            </label>
            <label className="flex items-center gap-2 text-slate-500">
              <input type="checkbox" disabled className="rounded opacity-50" />
              SLA breach email alerts — off
            </label>
            <label className="flex items-center gap-2 text-slate-500">
              <input type="checkbox" disabled className="rounded opacity-50" />
              Daily digest — off
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Inbound email-to-ticket ingestion remains available via{" "}
            <code className="rounded bg-slate-800 px-1">/api/email-ingest</code>
            {" "}when configured with a provider webhook and{" "}
            <code className="rounded bg-slate-800 px-1">EMAIL_INGEST_SECRET</code>.
          </p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="font-semibold">Operations</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <span className="text-slate-300">SLA cron</span> —{" "}
              <code className="rounded bg-slate-800 px-1 text-xs">
                /api/cron/sla
              </code>{" "}
              (daily 06:00 UTC via Vercel Cron)
            </li>
            <li>
              <span className="text-slate-300">Wall board</span> —{" "}
              <code className="rounded bg-slate-800 px-1 text-xs">/wall</code>{" "}
              realtime display for large monitors
            </li>
            <li>
              <span className="text-slate-300">Health</span> —{" "}
              <code className="rounded bg-slate-800 px-1 text-xs">
                /api/health
              </code>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
