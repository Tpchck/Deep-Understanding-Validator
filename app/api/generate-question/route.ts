import { streamText } from 'ai';
import { groq, MODEL_NAME } from '@/lib/ai';
import { checkRateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { checkInputValidity } from '@/lib/bouncer';

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

  const bouncerResult = await checkInputValidity(code);
  if (!bouncerResult.isValid) {
    return new Response(
      `REJECTED: DUV Security blocked this input. Reason: ${bouncerResult.reason}`,
      { status: 200 }
    );
  }

  const prompt = `You are a friendly, senior computer science mentor conducting a code review. 
You receive a code snippet from a developer.

First, think step-by-step about the code inside <thinking>...</thinking> tags. 
In your thinking:
1. Is this actual code (or config/pseudocode)? If not, decide on a polite refusal.
2. What is the real complexity of this code? (Beginner, Intermediate, Advanced).
3. What is ONE highly insightful, non-surface-level question you can ask to test their deep understanding? Focus on an unconsidered edge case, concurrency issue, or hidden architectural assumption.

After your <thinking> block, respond NATURALLY as a mentor.
- Start with a brief, encouraging greeting.
- State your question clearly.
- AT THE VERY END, append exactly: "**DIFFICULTY LEVEL:** [beginner|intermediate|advanced]"

--- FEW-SHOT EXAMPLES ---

Example 1 (Basic Code):
USER:
def add(a, b):
  return a + b

YOU:
<thinking>
1. Yes, this is basic Python code.
2. The complexity is very low. It's just adding two numbers. Level: beginner.
3. A good question would probe if they understand type coercion in Python (e.g., adding a string and an int).
</thinking>
Hi there! This is a nice, clean addition function. 

To test your understanding, what would happen in this function if I passed an integer for \`a\` and a string for \`b\`? How would Python handle it?

**DIFFICULTY LEVEL:** beginner

Example 2 (Advanced Code):
USER:
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);

YOU:
<thinking>
1. Yes, this is React code.
2. There's a subtle race condition issue if the component unmounts or re-renders quickly. Level: advanced.
3. A good question probes the lack of an AbortController or cleanup function.
</thinking>
Hello! This is a very common pattern in React for fetching data on mount.

However, I have a question about its resilience: What happens if the component unmounts before the \`fetch\` Promise resolves? What potential bug does this structure hide?

**DIFFICULTY LEVEL:** advanced

--- END EXAMPLES ---

Now evaluate the following code. Remember: Think inside <thinking> tags, then give a natural response ending with the difficulty level.

Code:
${code}`;

  let result;
  try {
    console.log("[generate-question] Starting CoT streamText for code snippet...");
    result = streamText({
      model: groq(MODEL_NAME),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75, // balanced for reasoning and natural tone
      maxOutputTokens: 1000,
      onFinish: async ({ text }) => {
        if (!text) return;

        const diffMatch = text.match(/\*\*DIFFICULTY LEVEL:\*\*\s*(beginner|intermediate|advanced)/i);
        const difficultyLevel = diffMatch ? diffMatch[1].toLowerCase() : 'medium';

        // Strip <thinking> block to prevent it from showing in the UI history
        const cleanedText = text.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();

        if (sessionId && !isTempStoreMode()) {
          try {
            const legacyDiff = difficultyLevel === 'beginner' ? 'easy' : (difficultyLevel === 'advanced' ? 'hard' : 'medium');
            
            const { error } = await supabase
              .from('questions')
              .update({ 
                question_text: cleanedText,
                difficulty_level: difficultyLevel,
                difficulty: legacyDiff // keep backwards compatibility for now
              })
              .eq('id', sessionId);
            if (error) console.error('[generate-question] DB save error:', error);
            else console.log('[generate-question] Saved CoT question to DB for session:', sessionId);
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
