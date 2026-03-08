'use server';

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateQuestions } from "@/lib/groq";
import { validateCodeSubmission } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { saveTempSession } from "@/lib/temp-store";

const isTempStoreMode = () => process.env.STORAGE_MODE === "temp";

export async function processCodeSubmission(formData: FormData) {
    const rawCode = formData.get("code");
    if (typeof rawCode !== "string") {
        return { error: "Code is required", success: false };
    }
    const code = rawCode;

    const validation = validateCodeSubmission(code);
    if (!validation.valid) {
        return { error: validation.error, success: false };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        console.error("[submit-code] Auth error:", authError.message);
    }

    if (user) {
        const limit = checkRateLimit(user.id);
        if (!limit.allowed) {
            const secs = Math.ceil((limit.retryAfterMs ?? 0) / 1000);
            return { error: `Too many requests. Try again in ${secs}s.`, success: false };
        }
    }

    let sessionId: string | null = null;

    try {
        const aiResponse = await generateQuestions(code);

        if (aiResponse.rejected) {
            return {
                error: aiResponse.rejectionMessage ?? "This doesn't look like code. Please paste a valid code snippet.",
                success: false,
            };
        }

        const q = aiResponse.questions[0];
        sessionId = crypto.randomUUID();

        if (isTempStoreMode()) {
            // In-memory store (for debugging / when Supabase is unavailable)
            saveTempSession(sessionId, {
                language: aiResponse.language,
                question: q.text,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                codeSnippet: code,
            });

        } else {
            // Supabase
            const { error: dbError } = await supabase.from("questions").insert({
                id: sessionId,
                question_text: q.text,
                code_snippet: code,
                options: [q.correctAnswer],
                correct_option_index: 0,
                explanation: q.explanation,
                difficulty: aiResponse.difficulty.toLowerCase(),
                language: aiResponse.language,
                user_id: user?.id ?? null,
                session_id: sessionId,
            });

            if (dbError) {
                console.error("[submit-code] DB insert error:", dbError);
                throw new Error(`Failed to save to DB: ${dbError.message}`);
            }

        }
    } catch (e) {
        console.error("[submit-code] Error:", e);
        const msg = e instanceof Error ? e.message : "Unknown error";
        return { error: `Analysis failed: ${msg}`, success: false };
    }

    revalidatePath("/", "layout");
    redirect(`/result/${sessionId}`);
}