import { defineFunction } from '@aws-amplify/backend';

export const aiProcessor = defineFunction({
  name: 'ai-processor',
  entry: './handler.ts',
  environment: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  },
  runtime: 18,
  timeoutSeconds: 300, // 5 minutes for AI processing
});