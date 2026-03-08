import { generateObject } from 'ai';
import { z } from 'zod';
import { groq, MODEL_NAME } from '@/lib/ai';
import { AIResponse } from "@/types";

export async function generateQuestions(code: string): Promise<AIResponse> {
  const prompt = `You are a senior computer science professor conducting a deep technical interview.
You receive a code snippet from a student. 

BEFORE doing anything, determine whether the input is ACTUAL CODE (any programming language, pseudocode, or config files count as code).
If the input is NOT code, return rejected: true.

If the input IS code, generate EXACTLY 1 highly insightful, open-ended question to test deep understanding.
Do NOT ask surface-level questions (like "What does this loop do?").
Instead, mentally trace the code and logically identify ONE potential unconsidered spot, edge case, or architectural flaw. 

Question formulation rules:
- Be inventive and simple in your phrasing. Don't use overly academic jargon.
- Probe a multi-factor vulnerability: e.g., "What happens if function X is called concurrently while Y is mutating the state?" or "Explain the hidden assumption this code makes about the input data structure."
- Focus on ONE specific, profound aspect of the code.

Code:
${code}`;

  try {
    const { object } = await generateObject({
      model: groq(MODEL_NAME),
      schema: z.object({
        rejected: z.boolean().optional(),
        rejectionMessage: z.string().optional(),
        language: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        topics: z.array(z.string()),
        questions: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
            correctAnswer: z.string(),
            explanation: z.string(),
          })
        ),
      }),
      prompt: prompt,
      temperature: 0.7,
    });

    return object as AIResponse;
  } catch (error: unknown) {
    console.error("Groq Generation Error:", error);
    
    // Detailed Error Handling for Groq API
    const err = error as { statusCode?: number; message?: string };
    
    if (err.statusCode === 429) {
      throw new Error("GROQ_RATE_LIMIT: Rate limit exceeded. Please wait a minute before trying again.");
    } else if (err.statusCode === 401) {
      throw new Error("GROQ_AUTH: Invalid API key. Please check your environment variables.");
    } else if (err.statusCode && err.statusCode >= 500) {
      throw new Error("GROQ_SERVER_ERROR: Groq servers are temporarily unavailable. Please try again later.");
    }

    throw new Error(`GROQ_UNKNOWN: Unknown error during generation (${err.message || "No details"}).`);
  }
}