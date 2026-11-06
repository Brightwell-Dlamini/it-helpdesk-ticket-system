"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createKnowledgeArticle } from "@/app/actions/knowledge";
import type { TicketCategory } from "@/types";
import { cn } from "@/lib/utils";

const categories: TicketCategory[] = [
  "hardware",
  "software",
  "network",
  "access",
  "email",
  "security",
  "other",
];

export default function NewKnowledgePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<TicketCategory>("software");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createKnowledgeArticle({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category,
      });
      if (result.success) {
        const id =
          result.data &&
          typeof result.data === "object" &&
          "id" in result.data
            ? String((result.data as { id: string }).id)
            : null;
        router.push(id ? `/knowledge/${id}` : "/knowledge");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to publish article");
      }
    });
  }

  return (
    <div>
      <Header
        title="New article"
        description="Publish a knowledge base guide"
        showNewTicket={false}
      />
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <div className="mb-6">
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to knowledge base
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="card animate-scale-in space-y-5 p-6 sm:p-8">
          <div className="flex items-start gap-3 border-b border-slate-800/70 pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 ring-1 ring-emerald-500/25">
              <BookPlus className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-50">Article details</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Agents and admins can publish self-service guides.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="How to…"
              disabled={isPending}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Summary <span className="text-red-400">*</span>
            </label>
            <input
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One-line description for the card list"
              disabled={isPending}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={isPending}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "chip capitalize",
                    category === c ? "chip-active" : "chip-idle"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full article body. Plain text is fine; use line breaks for structure."
              rows={12}
              disabled={isPending}
              className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-800/70 pt-5">
            <Link href="/knowledge">
              <Button type="button" variant="ghost" size="sm" disabled={isPending}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="min-w-[8rem] shadow-lg shadow-emerald-900/30"
            >
              {isPending ? "Publishing…" : "Publish article"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
