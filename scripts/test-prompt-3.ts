import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
  }
}

const aiClient = createGoogleGenerativeAI({
  apiKey: apiKey,
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
</evaluation>`;

  try {
    console.log("Calling Gemini via Vercel AI SDK...");
    const result = await generateText({
      model: aiClient('gemini-2.5-flash'),
      prompt: prompt,
      temperature: 0.3,
      // @ts-expect-error Vercel SDK requires maxTokens instead of maxOutputTokens
      maxTokens: 1000,
    });
    
    console.log("------------------- SDK RESULT -------------------");
    console.log("TEXT:\n" + result.text);
    console.log("\nFINISH REASON:", result.finishReason);
    console.log("------------------------------------------------");
    
  } catch (err) {
    console.error(err);
  }
}

main();
