import { Header } from "@/components/layout/header";

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" description="System configuration and preferences" />
      <div className="max-w-2xl space-y-6 p-6">
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="font-semibold">Organisation</h3>
          <p className="mt-1 text-sm text-slate-400">
            Configure organisation name, branding, and default SLA policies.
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
            <div>
              <label className="text-xs font-medium text-slate-500">
                Default SLA (hours)
              </label>
              <input
                type="number"
                defaultValue={8}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="font-semibold">Notifications</h3>
          <p className="mt-1 text-sm text-slate-400">
            Email and in-app notification preferences for agents and requesters.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              Email on new ticket assignment
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              SLA breach alerts
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Daily digest for managers
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
