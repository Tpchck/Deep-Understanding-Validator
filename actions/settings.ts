'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateNickname(formData: FormData) {
  const nickname = formData.get("nickname");
  if (typeof nickname !== "string") {
    return { error: "Nickname is required." };
  }
  if (nickname.length > 30) {
    return { error: "Nickname must be 30 characters or less." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { nickname: nickname.trim() || null },
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateEmail(formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });

  if (error) return { error: error.message };

  return { success: true, message: "Confirmation email sent to your new address. Please verify it." };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof password !== "string" || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };

  return { success: true };
}
