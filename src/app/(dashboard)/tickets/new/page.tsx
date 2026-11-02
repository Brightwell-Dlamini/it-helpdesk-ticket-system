"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createTicket } from "@/app/actions/tickets";
import type { TicketCategory, TicketPriority } from "@/types";

const categories: TicketCategory[] = [
  "hardware", "software", "network", "access", "email", "security", "other",
];
const priorities: TicketPriority[] = ["low", "medium", "high", "critical"];

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("software");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <Link href="/tickets" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to tickets
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary of the issue" disabled={isPending}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide as much detail as possible..." rows={6} disabled={isPending}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-y disabled:opacity-60" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)} disabled={isPending}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 capitalize disabled:opacity-60">
                {categories.map((c) => (<option key={c} value={c} className="capitalize">{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)} disabled={isPending}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 capitalize disabled:opacity-60">
                {priorities.map((p) => (<option key={p} value={p} className="capitalize">{p}</option>))}
              </select>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/tickets"><Button type="button" variant="ghost" size="sm" disabled={isPending}>Cancel</Button></Link>
            <Button type="submit" size="sm" disabled={isPending}>{isPending ? "Creating..." : "Create Ticket"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
