import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>
      <div className="relative animate-scale-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-xl shadow-emerald-900/40 ring-1 ring-emerald-400/30">
          <LifeBuoy className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-50">
          Page not found
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
          That route doesn&apos;t exist in ApexDesk. Head back to the dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button className="shadow-lg shadow-emerald-900/30">Go to Dashboard</Button>
          </Link>
          <Link href="/tickets">
            <Button variant="secondary">View tickets</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
