import { Header } from "@/components/layout/header";
import { getKnowledgeArticles } from "@/lib/data";
import { KnowledgeBoard } from "@/components/knowledge/knowledge-board";

export default async function KnowledgePage() {
  const articles = await getKnowledgeArticles();

  return (
    <div>
      <Header
        title="Knowledge Base"
        description={`${articles.length} self-service articles and how-to guides`}
        showNewTicket={false}
      />
      <KnowledgeBoard articles={articles} />
    </div>
  );
}
