import { streamText } from 'ai';
import { groq, MODEL_NAME } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export const maxDuration = 30;

const isTempStoreMode = () => process.env.STORAGE_MODE === 'temp';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const userId = user?.id || ip;
  
  const limit = checkRateLimit(userId);
  if (!limit.allowed) {
    return new Response("Rate limit exceeded. Please wait a minute.", { status: 429 });
  }

  const { prompt: code, sessionId } = await req.json();

  const prompt = `You are a senior computer science professor conducting a deep technical interview.
You receive a code snippet from a student. 

BEFORE doing anything, determine whether the input is ACTUAL CODE (any programming language, pseudocode, or config files count as code).
If the input is NOT code, reply exactly with: "REJECTED: This doesn't look like code. Please paste a valid code snippet."

If the input IS code, generate EXACTLY 1 highly insightful, open-ended question to test deep understanding.
Do NOT ask surface-level questions (like "What does this loop do?").
Instead, mentally trace the code and logically identify ONE potential unconsidered spot, edge case, or architectural flaw. 

Question formulation rules:
- Be inventive and simple in your phrasing. Don't use overly academic jargon.
- Probe a multi-factor vulnerability: e.g., "What happens if function X is called concurrently while Y is mutating the state?" or "Explain the hidden assumption this code makes about the input data structure."
- Focus on ONE specific, profound aspect of the code.
- Provide ONLY the question text. Do NOT include greetings, prefixes, or any JSON. Just the question.

Code:
${code}`;

  // NOTE: streamText is lazy — errors during the stream itself cannot be caught
  // by a surrounding try/catch because the response is already returned.
  let result;
  try {
    console.log("[generate-question] Starting streamText for code snippet...");
    result = streamText({
      model: groq(MODEL_NAME),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxOutputTokens: 600,
      onFinish: async ({ text }) => {
        // Persist the generated question to DB so page reloads don't re-call AI
        if (!text || text.startsWith('REJECTED:')) return;
        if (sessionId && !isTempStoreMode()) {
          try {
            const { error } = await supabase
              .from('questions')
              .update({ question_text: text })
              .eq('id', sessionId);
            if (error) console.error('[generate-question] DB save error:', error);
            else console.log('[generate-question] Saved question to DB for session:', sessionId);
          } catch (e) {
            console.error('[generate-question] Failed to save question:', e);
          }
        }
      },
      onError: ({ error }) => {
        console.error("[generate-question] Stream error:", error);
      },
    });
  } catch (error: unknown) {
    console.error("[generate-question] Setup error:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate question";
    return new Response(msg, { status: 500 });
  }

  return result.toTextStreamResponse();
}
