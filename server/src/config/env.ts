import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().default('pairplay-super-secure-jwt-secret-key-change-in-production-2026'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  GEMINI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);

process.env.DATABASE_URL = env.DATABASE_URL;
