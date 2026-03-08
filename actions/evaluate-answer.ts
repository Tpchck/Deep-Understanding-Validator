'use server';

import { generateObject } from 'ai';
import { z } from 'zod';
import { groq, MODEL_NAME } from '@/lib/ai';
import type { EvaluationResult } from "@/types";

export async function evaluateAnswer(
  questionText: string,
  correctAnswer: string,
  userAnswer: string,
  codeSnippet: string
): Promise<EvaluationResult> {
  if (!userAnswer.trim()) {
    return { score: 0, feedback: "You didn't provide an answer.", weakSpots: ["No answer provided"], understood: false };
  }

  const prompt = `You are a CS professor evaluating whether a student TRULY UNDERSTANDS their code. You're not trying to extract the perfect answer — you're checking if they grasp what they wrote.

QUESTION: ${questionText}

CODE:
${codeSnippet}

CORRECT ANSWER: ${correctAnswer}

STUDENT'S ANSWER: ${userAnswer}

Evaluation rules:
- Score from 0 to 100 based on how well the student demonstrates UNDERSTANDING
- 80-100: Solid understanding — they get the core concept, even if wording differs
- 50-79: Partial understanding — they have the right idea but miss important details
- 30-49: Weak understanding — they touch on something relevant but miss the main point
- 0-29: No real understanding — wrong concept, completely vague, or trying to dodge the question
- Be FLEXIBLE with wording — accept informal language that shows correct thinking
- Be STRICT with concepts — don't accept hand-waving or buzzword-dropping without substance
- Be SKEPTICAL of half-truths: if the student says something partially correct but avoids the hard part, score 40-65 and flag weakSpots

For weakSpots: identify SPECIFIC things the student got wrong, described incorrectly, or deliberately avoided explaining. Be concrete — name the exact concept or code element they missed. ALWAYS generate weakSpots for scores below 80 — even if the answer is decent, find what's missing or imprecise. If the student clearly understands (score >= 80), return an empty array.`;

  try {
    const { object } = await generateObject({
      model: groq(MODEL_NAME),
      schema: z.object({
        score: z.number().min(0).max(100),
        feedback: z.string(),
        weakSpots: z.array(z.string()),
      }),
      prompt: prompt,
      temperature: 0.3,
    });

    const score = object.score;
    return {
      score,
      feedback: object.feedback,
      weakSpots: object.weakSpots,
      understood: score >= 80,
    };
  } catch (error: unknown) {
    console.error("[evaluate-answer] Error:", error);
    const err = error as { statusCode?: number; message?: string };
    
    let feedback = "Произошла неизвестная ошибка при проверке ответа.";
    if (err.statusCode === 429) feedback = "Превышен лимит запросов к ИИ (Rate Limit). Подождите минуту.";
    else if (err.statusCode === 401) feedback = "Ошибка авторизации API-ключа.";
    else if (err.statusCode && err.statusCode >= 500) feedback = "Серверы ИИ временно недоступны.";

    return {
      score: 0,
      feedback,
      weakSpots: [],
      understood: false,
    };
  }
}
