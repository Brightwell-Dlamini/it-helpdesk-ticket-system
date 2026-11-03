export default function DashboardLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="mb-6 h-8 w-48 rounded-lg bg-slate-800" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-slate-800 bg-slate-900/50" />
        ))}
      </div>
      <div className="h-64 rounded-xl border border-slate-800 bg-slate-900/40" />
    </div>
  );
}
