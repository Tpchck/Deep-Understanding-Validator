import Groq from "groq-sdk";
import { AIResponse } from "@/types"; 

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateQuestions(code: string): Promise<AIResponse> {
  const prompt = `
    Role: Senior Software Architect.
    Task: Analyze the provided code snippet and generate 3 conceptual multiple-choice questions to test understanding.
    
    IMPORTANT: Return ONLY valid JSON. No markdown, no comments, no preamble.
    
    JSON Schema to follow:
    {
      "language": "string (Detected language)",
      "difficulty": "Easy" | "Medium" | "Hard",
      "topics": ["string", "string"],
      "questions": [
        {
          "id": "unique_string",
          "text": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0, // Index of correct option (0-3)
          "explanation": "Explanation why this answer is correct"
        }
      ]
    }

    Code to analyze:
    ${code}
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    
    const parsedData = JSON.parse(content);
    return parsedData as AIResponse;

  } catch (error) {
    console.error("Groq Generation Error:", error);
    throw new Error("Failed to generate questions via Groq");
  }
}