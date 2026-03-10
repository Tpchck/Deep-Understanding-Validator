import { createGroq } from '@ai-sdk/groq';

// Centralized Groq client using official Groq provider
export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODEL_NAME = 'llama-3.3-70b-versatile';