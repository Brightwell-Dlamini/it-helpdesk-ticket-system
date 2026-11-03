"use client";

import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600">
        <LifeBuoy className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-xl font-semibold">ApexDesk hit a snag</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        {error.message || "Unexpected application error."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button size="sm" onClick={reset}>
          Try again
        </Button>
        <Link href="/dashboard">
          <Button size="sm" variant="secondary">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
