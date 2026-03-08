import { createOpenAI } from '@ai-sdk/openai';

// Centralized Groq client using Vercel AI SDK (OpenAI compatibility mode)
export const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const MODEL_NAME = 'llama-3.3-70b-versatile';