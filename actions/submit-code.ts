'use server';

import { generateQuestions } from "@/lib/gemini/gemini"; // Проверь путь к файлу!
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function processCodeSubmission(formData: FormData) {
    const code = formData.get("code") as string;

    // Валидация
    if (!code || code.trim().length < 10) {
        return {
            error: "Code is too short",
            success: false
        };
    }

    let id: string | null = null;

    try {
        const AIResponse = await generateQuestions(code);
        const supabase = await createClient();
        const questionToSave = AIResponse.questions[0];
        const { data, error } = await supabase.from("questions").insert({
            question_text: questionToSave.text,
            code_snippet: code,
            options: questionToSave.options,
            correct_option_index: questionToSave.correctAnswer,
            explanation: questionToSave.explanation,
            difficulty: AIResponse.difficulty.toLowerCase(),
            language: AIResponse.language
        })
        .select()
        .single();

        if (error) {
            console.error("DB Error:", error);
            throw new Error("Failed to save to DB");
        }
        if (data) {
            id = data.id;
        }

    } catch (e) {
        console.error("Server Action Error:", e);
        return {
            error: e instanceof Error ? e.message : "An error occurred",
            success: false
        };
    }

    if (id) {
        redirect(`/result/${id}`);
    }

    return {
        success: true,
        id
    };
}