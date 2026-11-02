import { Header } from "@/components/layout/header";
import { dashboardStats } from "@/lib/mock-data";

export default function ReportsPage() {
  return (
    <div>
      <Header
        title="Reports & Analytics"
        description="Operational metrics and SLA performance"
      />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 font-semibold">SLA Compliance</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-emerald-400">
              {dashboardStats.slaCompliance}%
            </span>
            <span className="mb-1 text-sm text-slate-500">last 30 days</span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${dashboardStats.slaCompliance}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 font-semibold">Average First Response</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">
              {dashboardStats.avgResponseTimeHours}h
            </span>
            <span className="mb-1 text-sm text-slate-500">target: 2h</span>
          </div>
          <p className="mt-3 text-sm text-emerald-400">
            Within target · Strong performance
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Volume by Category (Mock)</h3>
          <div className="space-y-3">
            {[
              { cat: "Network", pct: 28 },
              { cat: "Access", pct: 22 },
              { cat: "Hardware", pct: 18 },
              { cat: "Software", pct: 15 },
              { cat: "Security", pct: 10 },
              { cat: "Other", pct: 7 },
            ].map((item) => (
              <div key={item.cat} className="flex items-center gap-3">
                <span className="w-24 text-sm text-slate-400">{item.cat}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500/80"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm text-slate-500">
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
