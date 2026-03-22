'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteAnalysis(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user can only delete their own

  if (error) {
    console.error("[deleteAnalysis] DB delete error:", error);
    return { success: false, error: error.message };
  }

  // Revalidate both dashboard and layout (where sidebar history is fetched)
  revalidatePath("/", "layout");

  return { success: true };
}
