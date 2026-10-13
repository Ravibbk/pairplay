import { z } from 'zod';

export const generateQuestionsRequestSchema = z.object({
  category: z.string().default('Deep Connections'),
  count: z.number().int().min(1).max(10).default(5),
  interests: z.array(z.string()).optional(),
  partnerName: z.string().optional(),
});

export const aiGeneratedQuestionItemSchema = z.object({
  text: z.string().min(10).max(200),
  category: z.string().min(2).max(50),
});

export const aiGeneratedQuestionsResponseSchema = z.object({
  questions: z.array(aiGeneratedQuestionItemSchema).min(1),
});
