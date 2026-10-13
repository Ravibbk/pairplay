import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters long').max(40),
  partnerCodeToConnect: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(40).optional(),
  avatarUrl: z.string().url().or(z.string().length(0)).optional(),
  bio: z.string().max(200).optional(),
  interests: z.array(z.string()).optional(),
  loveLanguage: z.string().max(50).optional(),
});

export const connectPartnerSchema = z.object({
  partnerCode: z.string().min(4, 'Partner code is required').trim().toUpperCase(),
});
