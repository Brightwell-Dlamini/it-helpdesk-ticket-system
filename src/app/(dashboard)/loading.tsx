export default function DashboardLoading() {
  return (
    <div className="animate-pulse p-4 sm:p-6">
      <div className="mb-6 space-y-2">
        <div className="h-6 w-40 rounded-lg bg-slate-800" />
        <div className="h-3.5 w-64 rounded bg-slate-800/70" />
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-950/80"
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800/80">
        <div className="border-b border-slate-800/80 px-5 py-4">
          <div className="h-4 w-32 rounded bg-slate-800" />
        </div>
        <div className="divide-y divide-slate-800/60">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-8 w-1 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-slate-800/80" />
                <div className="h-3.5 w-3/5 rounded bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
