import { Header } from "@/components/layout/header";
import { getKnowledgeArticles, getCurrentUser } from "@/lib/data";
import { KnowledgeBoard } from "@/components/knowledge/knowledge-board";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function KnowledgePage() {
  const [articles, me] = await Promise.all([
    getKnowledgeArticles(),
    getCurrentUser(),
  ]);

  const canPublish = me && (me.role === "admin" || me.role === "agent");

  return (
    <div>
      <Header
        title="Knowledge Base"
        description={`${articles.length} self-service articles and how-to guides`}
        showNewTicket={false}
        actions={
          canPublish ? (
            <Link href="/knowledge/new">
              <Button size="sm" className="min-h-9 shadow-md shadow-emerald-900/20">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New article</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          ) : undefined
        }
      />
      <KnowledgeBoard articles={articles} />
    </div>
  );
}
