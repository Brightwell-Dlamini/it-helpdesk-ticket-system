export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 space-y-2">
        <div className="skeleton h-6 w-40 rounded-lg" />
        <div className="skeleton h-3.5 w-64 rounded" />
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-24 rounded-xl border border-slate-800/50"
            style={{ animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-800/80">
        <div className="border-b border-slate-800/80 px-5 py-4">
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        <div className="divide-y divide-slate-800/60">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="skeleton h-8 w-1 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-3.5 w-3/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
