import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Centralized AI client using official Google provider
export const aiClient = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const MODEL_NAME = 'gemini-2.5-flash';