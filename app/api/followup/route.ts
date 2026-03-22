import { streamText } from 'ai';
import { groq, MODEL_NAME } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const userId = user?.id || ip;
  
  const limit = checkRateLimit(userId);
  if (!limit.allowed) {
    return new Response("Rate limit exceeded. Please wait a minute.", { status: 429 });
  }

  const { prompt: reqBody } = await req.json();
  const { originalQuestion, userAnswer, codeSnippet, weakSpots, difficultyLevel } = JSON.parse(reqBody);

  const difficultyText = difficultyLevel && difficultyLevel !== 'pending'
    ? `\nThis is a [**${difficultyLevel.toUpperCase()}**] level code evaluation. Adjust your follow-up strictness accordingly.`
    : '';

  const prompt = `You are a CS professor conducting an oral exam. The student answered a question about their code, but their answer revealed gaps in understanding. You need to ask ONE targeted follow-up question.
${difficultyText}

ORIGINAL QUESTION: ${originalQuestion}
STUDENT'S ANSWER: ${userAnswer}

CODE:
${codeSnippet}

WEAK SPOTS IN STUDENT'S ANSWER:
${weakSpots.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

Rules for the follow-up question:
- Pick the MOST IMPORTANT weak spot — the one that reveals the deepest misunderstanding
- Ask about something SPECIFIC the student said incorrectly or tried to avoid explaining
- Do NOT repeat the original question in different words
- Do NOT ask something completely new — stay within what the student already tried to answer
- Keep it focused and concrete — one specific thing to explain
- If the student seems to be struggling (multiple weak spots), make the question more approachable — give a small hint about WHAT to think about (e.g., "Think about the mechanism that Java uses to prevent two threads from entering the same method…") without revealing the full answer
- Write ONLY the text of the question. Do not include any formatting, JSON, preambles, or markdown.`;

  // NOTE: streamText is lazy — errors during the stream itself cannot be caught
  // by a surrounding try/catch because the response is already returned.
  let result;
  try {
    result = streamText({
      model: groq(MODEL_NAME),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      maxOutputTokens: 400,
      onError: ({ error }) => {
        console.error("[followup] Stream error:", error);
      },
    });
  } catch (error: unknown) {
    console.error("[followup] Setup error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate follow-up";
    return new Response(msg, { status: 500 });
  }

  return result.toTextStreamResponse();
}
