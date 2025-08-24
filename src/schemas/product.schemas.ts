import { z } from 'zod';

export const productSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  image: z.string().url(),
  rating: z.object({
    rate: z.number().min(0).max(5),
    count: z.number().int().min(0),
  }),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
});