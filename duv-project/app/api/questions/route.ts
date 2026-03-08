import { createClient } from "@/lib/supabase/server";
import { validateCodeSubmission } from "@/lib/utils";
import { generateQuestions } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

// POST /api/questions — submit code, get all questions back
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = checkRateLimit(user.id);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.retryAfterMs ?? 0) / 1000)) } }
    );
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validateCodeSubmission(body.code);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const aiResponse = await generateQuestions(body.code as string);
    const sessionId = crypto.randomUUID();

    const rows = aiResponse.questions.slice(0, 3).map((q) => ({
      question_text: q.text,
      code_snippet: body.code as string,
      options: [q.correctAnswer],
      correct_option_index: 0,
      explanation: q.explanation,
      difficulty: aiResponse.difficulty.toLowerCase(),
      language: aiResponse.language,
      user_id: user.id,
      session_id: sessionId,
    }));

    const { data, error } = await supabase
      .from("questions")
      .insert(rows)
      .select();

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error("API Error:", e);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}

// GET /api/questions — list user's questions
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }

  return NextResponse.json(data);
}
