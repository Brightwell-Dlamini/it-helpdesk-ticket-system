"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TicketCategory } from "@/types";

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createKnowledgeArticle(formData: {
  title: string;
  summary: string;
  content: string;
  category: TicketCategory;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: { id: "mock-kb-" + Date.now(), ...formData },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "agent"].includes(profile.role)) {
    return { success: false, error: "Only agents and admins can publish articles" };
  }

  const { data, error } = await supabase
    .from("knowledge_articles")
    .insert({
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      content: formData.content.trim(),
      category: formData.category,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/knowledge");
  return { success: true, data };
}

export async function incrementArticleViews(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("knowledge_articles")
      .select("views")
      .eq("id", id)
      .single();
    if (data) {
      await supabase
        .from("knowledge_articles")
        .update({ views: (data.views ?? 0) + 1 })
        .eq("id", id);
    }
  } catch {
    // non-critical
  }
}
