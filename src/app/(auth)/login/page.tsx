import { LifeBuoy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600">
            <LifeBuoy className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ApexDesk</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to the IT Service Desk
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <form className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400">
                Email address
              </label>
              <input
                type="email"
                defaultValue="brightwell@organization.sz"
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">
                Password
              </label>
              <input
                type="password"
                defaultValue="••••••••"
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <Link href="/dashboard" className="block">
              <Button className="w-full" size="lg">
                Sign in
              </Button>
            </Link>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Demo mode · No real authentication required
          </p>
        </div>
      </div>
    </div>
  );
}
