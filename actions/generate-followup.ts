'use server';

import Groq from "groq-sdk";
import type { FollowUpResult } from "@/types";

export async function generateFollowUp(
  originalQuestion: string,
  correctAnswer: string,
  userAnswer: string,
  codeSnippet: string,
  weakSpots: string[]
): Promise<FollowUpResult> {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `You are a CS professor conducting an oral exam. The student answered a question about their code, but their answer revealed gaps in understanding. You need to ask ONE targeted follow-up question.

ORIGINAL QUESTION: ${originalQuestion}
CORRECT ANSWER: ${correctAnswer}
STUDENT'S ANSWER: ${userAnswer}

CODE:
${codeSnippet}

WEAK SPOTS IN STUDENT'S ANSWER:
${weakSpots.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Rules for the follow-up question:
- Pick the MOST IMPORTANT weak spot — the one that reveals the deepest misunderstanding
- Ask about something SPECIFIC the student said incorrectly or tried to avoid explaining
- Do NOT repeat the original question in different words
- Do NOT ask something completely new — stay within what the student already tried to answer
- Frame it so the student must demonstrate understanding of that SPECIFIC detail
- Keep it focused and concrete — one specific thing to explain
- The goal is to check understanding, NOT to trick or punish the student

Return ONLY valid JSON, no markdown:
{
  "question": "your targeted follow-up question",
  "targetWeakness": "the specific weak spot this question probes"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return {
      question: parsed.question || "Can you explain that part in more detail?",
      targetWeakness: parsed.targetWeakness || weakSpots[0] || "",
    };
  } catch (error: unknown) {
    console.error("[generate-followup] Error:", error);
    const err = error as { status?: number; message?: string };
    
    let question = "Произошла техническая ошибка при генерации следующего вопроса. Не могли бы вы перефразировать ответ?";
    if (err.status === 429) question = "[Groq API Rate Limit] Слишком много запросов. Подождите пару минут и попробуйте снова.";
    else if (err.status === 401) question = "[Groq API Auth] Проблема с ключом доступа к ИИ.";
    else if (err.status && err.status >= 500) question = "[Groq API Error] Серверы нейросети временно недоступны. Повторите попытку позже.";

    return {
      question,
      targetWeakness: "Unknown",
    };
  }
}
