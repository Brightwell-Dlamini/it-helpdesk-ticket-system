import { Header } from "@/components/layout/header";
import { getKnowledgeArticles } from "@/lib/data";
import { ArrowLeft, BookOpen, Eye, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { id } = await params;
  const articles = await getKnowledgeArticles();
  const article = articles.find((a) => a.id === id);

  if (!article) notFound();

  return (
    <div>
      <Header title="Knowledge Base" description={article.title} showNewTicket={false} />
      <div className="p-4 sm:p-6">
        <Link
          href="/knowledge"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </Link>

        <article className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/15">
            <BookOpen className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/80">
            {article.category}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {article.title}
          </h1>
          <p className="mt-3 text-slate-400">{article.summary}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.views} views
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {article.helpful} found helpful
            </span>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
            {article.content}
          </div>
        </article>
      </div>
    </div>
  );
}
