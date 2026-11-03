export default function TicketsLoading() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="h-6 w-32 rounded bg-slate-800" />
        <div className="mt-2 h-4 w-48 rounded bg-slate-900" />
      </div>
      <div className="space-y-3 p-6">
        <div className="h-10 max-w-md rounded-lg bg-slate-900" />
        <div className="h-8 w-full max-w-xl rounded-lg bg-slate-900/80" />
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-slate-800/80 px-4 py-4"
            >
              <div className="h-10 flex-1 rounded bg-slate-900" />
              <div className="h-6 w-20 rounded bg-slate-900" />
              <div className="h-6 w-16 rounded bg-slate-900" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
