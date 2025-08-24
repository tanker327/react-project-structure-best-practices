import { z } from 'zod';

export const addressSchema = z.object({
  city: z.string(),
  street: z.string(),
  number: z.number(),
  zipcode: z.string(),
  geolocation: z.object({
    lat: z.string(),
    long: z.string(),
  }),
});

export const nameSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
});

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(1),
  name: nameSchema,
  address: addressSchema,
  phone: z.string(),
});

export const userPreferencesSchema = z.object({
  userId: z.number(),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  language: z.string().default('en'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }).default({}),
});