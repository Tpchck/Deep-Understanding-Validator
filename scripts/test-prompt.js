"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const ai_1 = require("ai");
const google_1 = require("@ai-sdk/google");
const aiClient = (0, google_1.createGoogleGenerativeAI)({
    apiKey: process.env.GEMINI_API_KEY,
});
async function main() {
    const prompt = `You are a CS professor evaluating whether a student TRULY UNDERSTANDS their code. You're not trying to extract the perfect answer — you're checking if they grasp what they wrote.

This is a [**BEGINNER**] level question. Adjust your expectations accordingly:
- Be extremely forgiving with terminology as long as the core concept is correct.

QUESTION: Hey there! Thanks for sharing this \`greet\` function. It's a classic example, and I like how clear it is. I have a question about the very last line, \`print(greet("World"))\`. What will happen when you run this script as-is, and why?

CODE:
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

STUDENT'S ANSWER: This function takes a name parameter and returns a formatted greeting string using an f-string. When called with World it prints Hello World.

Evaluation rules:
- Score from 0 to 100 based on how well the student demonstrates UNDERSTANDING
- 80-100: Solid understanding — they get the core concept, even if wording differs
- 50-79: Partial understanding — they have the right idea but miss important details
- 30-49: Weak understanding — they touch on something relevant but miss the main point
- 0-29: No real understanding — wrong concept, completely vague, or trying to dodge the question
- ZERO TOLERANCE FOR REPETITION: If the student merely repeats the prompt/question back to you, copy-pastes the code without explaining, or gives a non-answer, the score MUST be exactly 0. You are strictly evaluating their explanation.
- Be extremely forgiving with terminology as long as the core concept is correct.
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
        console.log("Calling Gemini...");
        const { text } = await (0, ai_1.generateText)({
            model: aiClient('gemini-2.5-flash'),
            prompt: prompt,
            temperature: 0.3,
            maxOutputTokens: 1024,
        });
        console.log("------------------- RAW TEXT -------------------");
        console.log(text);
        console.log("------------------------------------------------");
    }
    catch (err) {
        console.error(err);
    }
}
main();
