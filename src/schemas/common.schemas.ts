import { z } from 'zod';

export const paginationRequestSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const paginationResponseSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
});

export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  data: dataSchema,
  message: z.string().optional(),
  timestamp: z.string(),
});

export const apiErrorResponseSchema = z.object({
  message: z.string(),
  code: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.string(),
});