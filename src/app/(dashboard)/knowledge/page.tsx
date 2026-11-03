import { Header } from "@/components/layout/header";
import { getKnowledgeArticles } from "@/lib/data";
import { BookOpen, Eye, ThumbsUp, Search } from "lucide-react";
import Link from "next/link";

export default async function KnowledgePage() {
  const articles = await getKnowledgeArticles();

  return (
    <div>
      <Header
        title="Knowledge Base"
        description={`${articles.length} self-service articles and how-to guides`}
        showNewTicket={false}
      />
      <div className="p-4 sm:p-6">
        <div className="mb-5 relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search articles..."
            className="h-11 w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 sm:h-10"
            disabled
            title="Browse by card for now"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/knowledge/${article.id}`}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700 active:bg-slate-900"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/15">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold leading-snug">{article.title}</h3>
              <p className="mt-2 text-sm text-slate-400 line-clamp-2">
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
      </div>
    </div>
  );
}
