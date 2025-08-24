import { z } from 'zod';
import { userSchema } from './user.schemas';

export const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});

export const authStateSchema = z.object({
  user: userSchema.nullable(),
  token: z.string().nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});