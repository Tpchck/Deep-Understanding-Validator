import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIResponse } from "@/types"; 

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig: { responseMimeType: "application/json" } 
  });
}

export async function generateQuestions(code: string): Promise<AIResponse> {
  if (process.env.USE_MOCK_AI === "true") {
    console.log("⚠️ USING MOCK AI RESPONSE (No API credits used)");
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      language: "MockLang",
      difficulty: "easy",
      topics: ["Mocking", "System Design"],
      questions: [
        {
          id: "mock-q1",
          text: "Why does using a mock during development prevent cascading failures in integration tests, and what specific mechanism makes this isolation effective?",
          correctAnswer: "Mocks replace real dependencies with controlled substitutes that return predictable responses, preventing cascading failures because the test never touches external systems that could fail or change state independently.",
          explanation: "The key mechanism is dependency injection — the mock implements the same interface as the real dependency but with deterministic behavior. This means network issues, API rate limits, or database state cannot affect test outcomes. A common misconception is that mocks just 'skip' the dependency — in reality, they actively simulate it."
        },
        {
          id: "mock-q2",
          text: "If you changed the mock to return data asynchronously with a random delay between 0-5 seconds instead of a fixed 1.5s delay, what subtle testing problem would emerge?",
          correctAnswer: "Tests would become flaky due to non-deterministic timing — assertions that depend on execution order could intermittently fail, and test timeouts might be hit unpredictably.",
          explanation: "Non-deterministic delays introduce race conditions in tests. If multiple async operations depend on mock responses, the random ordering could cause different code paths to execute in different test runs. This is why mocks should always be deterministic — the entire point is to remove variability."
        },
        {
          id: "mock-q3",
          text: "Under what precise condition would relying on this mock give you a false sense of security, passing all tests while the production code has a critical bug?",
          correctAnswer: "If the real API's response schema changes (e.g., a field is renamed or its type changes) but the mock still returns the old format, all tests pass while production breaks due to the schema mismatch.",
          explanation: "This is called 'mock drift' — when mocks diverge from the actual dependency's behavior. Contract testing or periodic validation against the real API is needed to catch this. Another case: if the real API enforces rate limits or auth that the mock doesn't simulate, production-only failures go undetected."
        }
      ]
    };
  }
 
  try {
    const prompt = `You are a senior computer science professor known for writing tricky exam questions that expose shallow understanding. Your questions should be non-obvious and require genuine deep reasoning — not surface-level recall.

Analyze the code below and generate exactly 3 open-ended questions (NOT multiple choice). The student will type their answer in free text.

Rules for question design — CRITICAL:
1. Each question must target a DIFFERENT cognitive level, and must be HARD to answer without true understanding:
   - Q1: Hidden mechanics — Ask about non-obvious internal behavior
   - Q2: Adversarial modification — Ask about a specific change that would break the code in a non-obvious way
   - Q3: Boundary trap — Ask about a specific edge case or hidden assumption

2. Rules for correct answers:
   - The correct answer (correctAnswer field) should be a concise but complete text answer (1-3 sentences)
   - The answer must be specific, not vague
   - The explanation should go deeper than the answer

3. Questions should require understanding of the ACTUAL code provided.

Return ONLY valid JSON:
{
  "language": "detected language",
  "difficulty": "Easy" | "Medium" | "Hard",
  "topics": ["topic1", "topic2"],
  "questions": [
    {
      "id": "q1",
      "text": "question text",
      "correctAnswer": "the correct answer as text",
      "explanation": "detailed explanation addressing common misconceptions"
    }
  ]
}

Code:
${code}`;
    
    const result = await getGeminiModel().generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate questions");
  }
}