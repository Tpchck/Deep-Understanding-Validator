'use server';

import Groq from "groq-sdk";
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

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

For weakSpots: identify SPECIFIC things the student got wrong, described incorrectly, or deliberately avoided explaining. Be concrete — name the exact concept or code element they missed. ALWAYS generate weakSpots for scores below 80 — even if the answer is decent, find what's missing or imprecise. If the student clearly understands (score >= 80), return an empty array.

Return ONLY valid JSON, no markdown:
{
  "score": 0-100,
  "feedback": "What they got right and wrong",
  "weakSpots": ["specific thing 1 they got wrong or skipped", "specific thing 2"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    return {
      score,
      feedback: parsed.feedback || "No feedback available.",
      weakSpots: Array.isArray(parsed.weakSpots) ? parsed.weakSpots : [],
      understood: score >= 80,
    };
  } catch (error) {
    console.error("[evaluate-answer] Error:", error);
    return {
      score: 0,
      feedback: "Could not evaluate your answer. Please try again.",
      weakSpots: [],
      understood: false,
    };
  }
}
