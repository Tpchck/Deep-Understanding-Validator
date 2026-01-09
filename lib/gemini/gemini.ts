import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIResponse } from "@/types"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "fake_key");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash-8b", 
  generationConfig: { responseMimeType: "application/json" } 
});

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
          text: "Why do we use Mocks during development?",
          codeSnippet: "if (process.env.MOCK) return fakeData;",
          options: [
            "To ignore errors",
            "To save API quota and speed up iteration", // Correct
            "Because Google hates us",
            "To make code slower"
          ],
          correctAnswer: 1,
          explanation: "Mocking isolates your application from external unstable dependencies like 3rd party APIs."
        },
        {
          id: "mock-q2",
          text: "What is the Big O complexity of accessing an array by index?",
          codeSnippet: "int x = arr[5];",
          options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
          correctAnswer: 0,
          explanation: "Array access is a constant time operation via pointer arithmetic."
        },
        {
          id: "mock-q3",
          text: "Which memory segment stores local variables?",
          codeSnippet: "void func() { int x = 10; }",
          options: ["Heap", "Stack", "Data Segment", "Code Segment"],
          correctAnswer: 1,
          explanation: "Local variables are pushed onto the Stack frame when the function is called."
        }
      ]
    };
  }
 
  try {
    const prompt = `
      Analyze this code. Generate 3 conceptual questions in JSON.
      Code: ${code}
    `;
    
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate questions");
  }
}