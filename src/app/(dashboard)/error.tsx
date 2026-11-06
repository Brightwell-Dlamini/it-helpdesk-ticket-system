"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center animate-fade-up">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/25">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-50">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-slate-600">
          Digest {error.digest}
        </p>
      )}
      <Button className="mt-6" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
