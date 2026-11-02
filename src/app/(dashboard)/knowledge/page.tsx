import { Header } from "@/components/layout/header";
import { knowledgeArticles } from "@/lib/mock-data";
import { BookOpen, Eye, ThumbsUp } from "lucide-react";

export default function KnowledgePage() {
  return (
    <div>
      <Header
        title="Knowledge Base"
        description="Self-service articles and how-to guides"
      />
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {knowledgeArticles.map((article) => (
          <article
            key={article.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-slate-700"
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
          </article>
        ))}
      </div>
    </div>
  );
}
