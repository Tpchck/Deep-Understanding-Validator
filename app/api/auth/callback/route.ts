import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// handles the redirect after email confirmation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // something went wrong, back to login
  return NextResponse.redirect(new URL("/login", request.url));
}
