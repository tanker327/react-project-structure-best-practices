import { z } from 'zod';
import { loginRequestSchema, loginResponseSchema, authStateSchema } from '@/schemas/auth.schemas';

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type AuthState = z.infer<typeof authStateSchema>;