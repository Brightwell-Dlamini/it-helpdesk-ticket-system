export default function TicketDetailLoading() {
  return (
    <div className="animate-pulse p-6">
      <div className="mb-6 h-4 w-28 rounded bg-slate-800" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-48 rounded-xl border border-slate-800 bg-slate-900/50" />
          <div className="h-72 rounded-xl border border-slate-800 bg-slate-900/50" />
        </div>
        <div className="space-y-4">
          <div className="h-56 rounded-xl border border-slate-800 bg-slate-900/50" />
          <div className="h-40 rounded-xl border border-slate-800 bg-slate-900/50" />
        </div>
      </div>
    </div>
  );
}
