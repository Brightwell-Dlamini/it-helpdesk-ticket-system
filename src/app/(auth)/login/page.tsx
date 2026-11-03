"use client";

import { LifeBuoy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("brightwell@organization.sz");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      if (!supabaseConfigured) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      try {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch {
        setError("Unable to sign in. Please try again.");
      }
    });
  }

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                placeholder={supabaseConfigured ? "Enter password" : "Demo mode — any value"}
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button className="w-full" size="lg" type="submit" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            {supabaseConfigured
              ? "Use your organisation credentials"
              : "Demo mode · No real authentication required"}
          </p>
        </div>

        {!supabaseConfigured && (
          <p className="mt-6 text-center text-xs text-slate-600">
            <Link href="/dashboard" className="text-emerald-500 hover:text-emerald-400">
              Continue to dashboard →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
