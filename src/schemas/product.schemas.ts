import { z } from 'zod';

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string(),
  inventory: z.number().int().min(0),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
});