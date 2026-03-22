'use server';

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { validateCodeSubmission, detectLanguage } from "@/lib/utils";
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

    const sessionId = crypto.randomUUID();
    const detectedLanguage = detectLanguage(code);

    try {
        if (isTempStoreMode()) {
            // In-memory store (for debugging / when Supabase is unavailable)
            saveTempSession(sessionId, {
                language: detectedLanguage,
                question: '', // Empty initially, we will stream it
                correctAnswer: '',
                explanation: '',
                codeSnippet: code,
            });
        } else {
            // Supabase
            const { error: dbError } = await supabase.from("questions").insert({
                id: sessionId,
                question_text: '', // Empty initially
                code_snippet: code,
                options: [],
                correct_option_index: 0,
                explanation: '',
                difficulty: 'pending', // AI will overwrite this
                difficulty_level: 'pending', // AI will overwrite this
                language: detectedLanguage,
                user_id: user?.id ?? null,
                session_id: sessionId,
            });

            if (dbError) {
                console.error("[submit-code] DB insert error:", dbError);
                throw new Error(`Failed to save to DB: ${dbError.message}`);
            }
        }
    } catch (e: unknown) {
        console.error("[submit-code] Error:", e);
        const msg = e instanceof Error ? e.message : "Unknown error";
        return { error: msg, success: false };
    }

    revalidatePath("/", "layout");
    redirect(`/result/${sessionId}`);
}