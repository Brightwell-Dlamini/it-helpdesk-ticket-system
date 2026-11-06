"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  Monitor,
  AppWindow,
  Wifi,
  KeyRound,
  Mail,
  Shield,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, useRef } from "react";
import { createTicket } from "@/app/actions/tickets";
import type { TicketCategory, TicketPriority } from "@/types";
import { cn } from "@/lib/utils";

const categories: {
  value: TicketCategory;
  label: string;
  icon: typeof Monitor;
}[] = [
  { value: "hardware", label: "Hardware", icon: Monitor },
  { value: "software", label: "Software", icon: AppWindow },
  { value: "network", label: "Network", icon: Wifi },
  { value: "access", label: "Access", icon: KeyRound },
  { value: "email", label: "Email", icon: Mail },
  { value: "security", label: "Security", icon: Shield },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

const priorities: TicketPriority[] = ["low", "medium", "high", "critical"];

const priorityStyles: Record<TicketPriority, string> = {
  low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  medium:
    "border-amber-500/40 bg-amber-500/10 text-amber-300 ring-amber-500/30",
  high: "border-orange-500/40 bg-orange-500/10 text-orange-300 ring-orange-500/30",
  critical: "border-red-500/50 bg-red-500/15 text-red-300 ring-red-500/40",
};

const TITLE_MAX = 120;
const DESC_MAX = 4000;

export default function NewTicketPage() {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("software");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });
      if (result.success) {
        router.push("/tickets");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create ticket");
      }
    });
  }

  return (
    <div>
      <Header title="New Ticket" description="Create a new support request" />
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <div className="mb-6">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tickets
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card animate-scale-in space-y-6 p-6 sm:p-8"
        >
          <div className="flex items-start gap-3 border-b border-slate-800/70 pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 ring-1 ring-emerald-500/25">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-50">Describe the issue</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Clear titles and detail help agents resolve faster.
              </p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-400">
                Title <span className="text-red-400">*</span>
              </label>
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  title.length > TITLE_MAX * 0.9
                    ? "text-amber-400"
                    : "text-slate-600"
                )}
              >
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              ref={titleRef}
              required
              maxLength={TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the issue"
              disabled={isPending}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-sm placeholder:text-slate-500 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-400">
                Description <span className="text-red-400">*</span>
              </label>
              <span
                className={cn(
                  "text-[11px] tabular-nums",
                  description.length > DESC_MAX * 0.9
                    ? "text-amber-400"
                    : "text-slate-600"
                )}
              >
                {description.length}/{DESC_MAX}
              </span>
            </div>
            <textarea
              required
              maxLength={DESC_MAX}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? Steps to reproduce, error messages, impact…"
              rows={6}
              disabled={isPending}
              className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-sm placeholder:text-slate-500 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
            />
            <p className="mt-1.5 text-[11px] text-slate-600">
              Tip: include error codes, when it started, and who is affected.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((c) => {
                const Icon = c.icon;
                const active = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    disabled={isPending}
                    onClick={() => setCategory(c.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all",
                      active
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30"
                        : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-emerald-400" : "text-slate-500"
                      )}
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={isPending}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-semibold capitalize transition-all",
                    priority === p
                      ? cn(priorityStyles[p], "ring-1")
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-800/70 pt-5">
            <Link href="/tickets">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !title.trim() || !description.trim()}
              className="min-w-[8rem] shadow-lg shadow-emerald-900/30"
            >
              {isPending ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
