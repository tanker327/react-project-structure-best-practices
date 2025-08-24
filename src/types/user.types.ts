import { z } from 'zod';
import { userSchema, userPreferencesSchema, nameSchema, addressSchema } from '@/schemas/user.schemas';

export type User = z.infer<typeof userSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type Name = z.infer<typeof nameSchema>;
export type Address = z.infer<typeof addressSchema>;

export type UserProfile = User & {
  preferences: UserPreferences;
  lastLoginAt?: string;
};

export type UserSession = {
  user: User;
  token: string;
  expiresAt: string;
};