import { z } from 'zod';

export const submitAnswerSchema = z.object({
  gameSessionId: z.string().uuid(),
  gameQuestionId: z.string().uuid(),
  answerText: z.string().min(1, 'Answer cannot be empty').max(1000, 'Answer is too long'),
});

export const reactToAnswerSchema = z.object({
  gameAnswerId: z.string().uuid(),
  reaction: z.string().min(1).max(10), // e.g. "❤️", "😂", "✨", "🤔"
});

export const nextQuestionSchema = z.object({
  gameSessionId: z.string().uuid(),
});
