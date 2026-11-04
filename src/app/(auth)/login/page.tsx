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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/12 blur-[100px]" />
        <div className="absolute -right-40 bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#020617_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-2xl shadow-emerald-900/50 ring-1 ring-emerald-400/30">
            <LifeBuoy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            ApexDesk
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to the IT Service Desk
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-7">
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
                className="mt-1.5 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 py-2.5 text-sm transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
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
                placeholder={
                  supabaseConfigured
                    ? "Enter password"
                    : "Demo mode — any value"
                }
                className="mt-1.5 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 py-2.5 text-sm transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button
              className="w-full shadow-xl shadow-emerald-900/40"
              size="lg"
              type="submit"
              disabled={isPending}
            >
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
            <Link
              href="/dashboard"
              className="font-medium text-emerald-500 transition-colors hover:text-emerald-400"
            >
              Continue to dashboard →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
