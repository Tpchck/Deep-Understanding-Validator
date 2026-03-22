'use server';

import { generateText } from 'ai';
import { groq, MODEL_NAME } from '@/lib/ai';
import type { EvaluationResult } from "@/types";

export async function evaluateAnswer(
  questionText: string,
  userAnswer: string,
  codeSnippet: string,
  difficultyLevel?: string
): Promise<EvaluationResult> {
  if (!userAnswer.trim()) {
    return { score: 0, feedback: "You didn't provide an answer.", weakSpots: ["No answer provided"], understood: false };
  }

  // Heuristic: Check if user just copy-pasted the question
  const normalizedQuestion = questionText.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedAnswer = userAnswer.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalizedAnswer.length > 10 && (normalizedQuestion.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedQuestion))) {
    return { 
      score: 0, 
      feedback: "You just repeated the question or its core parts. Please actually explain your understanding in your own words.", 
      weakSpots: ["Evasion: Repeated the prompt instead of answering"], 
      understood: false 
    };
  }

  const difficultyText = difficultyLevel && difficultyLevel !== 'pending' 
    ? `\nThis is a [**${difficultyLevel.toUpperCase()}**] level question. Adjust your expectations accordingly:` 
    : '';

  const difficultyRules = difficultyLevel === 'beginner' 
    ? '- Be extremely forgiving with terminology as long as the core concept is correct.'
    : difficultyLevel === 'advanced'
    ? '- Be rigorous. Expect precise terminology and a deep architectural explanation.'
    : '- Be FLEXIBLE with wording — accept informal language that shows correct thinking, but be STRICT with concepts.';

  const prompt = `You are a CS professor evaluating whether a student TRULY UNDERSTANDS their code. You're not trying to extract the perfect answer — you're checking if they grasp what they wrote.
${difficultyText}

QUESTION: ${questionText}

CODE:
${codeSnippet}

STUDENT'S ANSWER: ${userAnswer}

Evaluation rules:
- Score from 0 to 100 based on how well the student demonstrates UNDERSTANDING
- 80-100: Solid understanding — they get the core concept, even if wording differs
- 50-79: Partial understanding — they have the right idea but miss important details
- 30-49: Weak understanding — they touch on something relevant but miss the main point
- 0-29: No real understanding — wrong concept, completely vague, or trying to dodge the question
- ZERO TOLERANCE FOR REPETITION: If the student merely repeats the prompt/question back to you, copy-pastes the code without explaining, or gives a non-answer, the score MUST be exactly 0. You are strictly evaluating their explanation.
${difficultyRules}
- Be SKEPTICAL of half-truths: if the student says something partially correct but avoids the hard part, score 40-65 and flag weakSpots

Feedback structure (IMPORTANT):
- FIRST, briefly acknowledge what the student got RIGHT — even partial correctness deserves recognition
- THEN explain what is missing, wrong, or needs deeper understanding
- Keep feedback to 2-3 sentences maximum. Be direct, not verbose.

For weakSpots: identify SPECIFIC things the student got wrong, described incorrectly, or deliberately avoided explaining. Be concrete.
- If score >= 80: the student clearly understands, return an empty weakSpots array.
- If score < 80: you MUST return at least one weakSpot. NEVER return an empty weakSpots array if the score is below 80. Even if the answer is mostly right, pinpoint the missing piece.

Return EXACTLY a raw JSON object (no markdown formatting, no backticks) with this exact schema:
{
  "score": number,
  "feedback": "string",
  "weakSpots": ["string"]
}`;

  try {
    const { text } = await generateText({
      model: groq(MODEL_NAME),
      prompt: prompt,
      temperature: 0.3,
      maxOutputTokens: 500,
    });

    console.log("[evaluate-answer] Raw text from Groq:", text);

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const object = JSON.parse(cleanText);

    console.log("[evaluate-answer] Parsed JSON:", object);

    const score = typeof object.score === 'number' ? object.score : 0;
    const weakSpots: string[] = Array.isArray(object.weakSpots) ? object.weakSpots : [];

    // Safety net: if score < 80, ensure at least one weakSpot exists
    if (score >= 20 && score < 80 && weakSpots.length === 0) {
      weakSpots.push('Partial understanding — key details missing or incorrectly explained');
    }

    return {
      score,
      feedback: typeof object.feedback === 'string' ? object.feedback : 'Unable to parse feedback.',
      weakSpots,
      understood: score >= 80,
    };
  } catch (error: unknown) {
    console.error("[evaluate-answer] Error:", error);
    const err = error as { statusCode?: number; message?: string };
    
    let feedback = "An unknown error occurred while evaluating your answer.";
    if (err.statusCode === 429) feedback = "AI rate limit exceeded. Please wait a minute.";
    else if (err.statusCode === 401) feedback = "API key authorization error.";
    else if (err.statusCode && err.statusCode >= 500) feedback = "AI servers are temporarily unavailable.";

    return {
      score: 0,
      feedback,
      weakSpots: [],
      understood: false,
    };
  }
}
