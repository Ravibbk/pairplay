import { z } from 'zod';

export const createRoomSchema = z.object({
  category: z.string().default('Deep Connections'),
});

export const joinRoomSchema = z.object({
  code: z.string().min(4).max(10).trim().toUpperCase(),
});
