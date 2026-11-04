"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export type ActionResult = {
  success: boolean;
  error?: string;
};

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!me || me.role !== "admin") {
    return { success: false, error: "Only admins can change roles" };
  }

  if (userId === user.id && role !== "admin") {
    return { success: false, error: "You cannot demote your own admin role" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/users");
  return { success: true };
}
