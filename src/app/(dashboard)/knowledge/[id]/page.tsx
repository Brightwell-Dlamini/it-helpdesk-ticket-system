import { Header } from "@/components/layout/header";
import { getKnowledgeArticleById } from "@/lib/data";
import { incrementArticleViews } from "@/app/actions/knowledge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Eye, ThumbsUp, BookOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await getKnowledgeArticleById(id);

  if (!article) {
    notFound();
  }

  void incrementArticleViews(id);

  return (
    <div>
      <Header title="Knowledge Base" description={article.title} showNewTicket={false} />

      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <Link
          href="/knowledge"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </Link>

        <article className="card overflow-hidden">
          <div className="border-b border-slate-800/80 bg-gradient-to-br from-emerald-500/5 to-transparent p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/15 ring-1 ring-emerald-500/20">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <Badge className="border-slate-500/30 bg-slate-500/15 capitalize text-slate-400">
                {article.category}
              </Badge>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              {article.title}
            </h1>
            <p className="mt-2 text-slate-400">{article.summary}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.views} views
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                {article.helpful} found helpful
              </span>
              <span>Updated {formatDate(article.updatedAt)}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {article.content}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
