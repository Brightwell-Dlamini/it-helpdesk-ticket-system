"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Eye, ThumbsUp, Search, X } from "lucide-react";
import type { KnowledgeArticle } from "@/types";

export function KnowledgeBoard({ articles }: { articles: KnowledgeArticle[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(articles.map((a) => a.category));
    return ["all", ...Array.from(set).sort()];
  }, [articles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!q) return true;
      const hay = [a.title, a.summary, a.content, a.category]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [articles, search, category]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title, topic, content..."
            className="h-11 w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 sm:h-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                category === c
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {c === "all" ? "All categories" : c}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {articles.length} articles
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 px-4 py-12 text-center text-sm text-slate-500">
          No articles match your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge/${article.id}`}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700 active:bg-slate-900"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/15">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold leading-snug">{article.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                {article.summary}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {article.views}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {article.helpful}
                </span>
                <span className="ml-auto capitalize">{article.category}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
