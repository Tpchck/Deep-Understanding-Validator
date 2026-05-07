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

QUESTION: Hi there! Thanks for sharing your \`greet\` function. It's a clear way to construct a greeting string. I have a question about the very last line of your snippet: \`print(greet("World"))\`. Can you explain why this line, as it's currently placed, will never actually execute? What would you need to change to make it run?

CODE:
def greet(name):
    return f"Hello, {name}!"
    
    print(greet("World"))

STUDENT'S ANSWER: This function takes a name parameter and returns a formatted greeting string using an f-string. When called with World it prints Hello World.

Return EXACTLY the following XML format (do not use markdown blocks):
<evaluation>
  <score>number (0-100)</score>
  <feedback>your feedback here</feedback>
  <weakSpots>
    <spot>first weak spot</spot>
    <spot>second weak spot</spot>
  </weakSpots>
</evaluation>`;
    try {
        console.log("Calling Gemini via Vercel AI SDK...");
        const result = await (0, ai_1.generateText)({
            model: aiClient('gemini-2.5-flash'),
            prompt: prompt,
            temperature: 0.3,
            maxOutputTokens: 1024,
        });
        console.log("------------------- SDK RESULT -------------------");
        console.log("TEXT:\n" + result.text);
        console.log("\nFINISH REASON:", result.finishReason);
        console.log("USAGE:", result.usage);
        console.log("------------------------------------------------");
    }
    catch (err) {
        console.error(err);
    }
}
main();
