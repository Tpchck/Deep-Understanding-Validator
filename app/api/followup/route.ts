import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { checkRateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

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
  const { originalQuestion, correctAnswer, userAnswer, codeSnippet, weakSpots } = JSON.parse(reqBody);

  const prompt = `You are a CS professor conducting an oral exam. The student answered a question about their code, but their answer revealed gaps in understanding. You need to ask ONE targeted follow-up question.

ORIGINAL QUESTION: ${originalQuestion}
CORRECT ANSWER: ${correctAnswer}
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
- Write ONLY the text of the question. Do not include any formatting, JSON, preambles, or markdown.`;

  try {
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("Streaming error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate follow-up";
    return new Response(msg, { status: 500 });
  }
}
