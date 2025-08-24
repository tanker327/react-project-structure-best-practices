import { z } from 'zod';
import { paginationRequestSchema, paginationResponseSchema, apiErrorResponseSchema } from '@/schemas/common.schemas';

export type PaginationRequest = z.infer<typeof paginationRequestSchema>;
export type PaginationResponse = z.infer<typeof paginationResponseSchema>;
export type ApiResponse<T> = {
  data: T;
  message?: string;
  timestamp: string;
};
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;