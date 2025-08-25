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

// Common UI type definitions to avoid repetition across components

// Notification/Alert types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

// Size variants (used by multiple components)
export type SizeVariant = 'small' | 'medium' | 'large';

// Theme variants
export type ThemeVariant = 'light' | 'dark' | 'auto';

// Shadow variants (used by Card and potentially other components)
export type ShadowVariant = 'none' | 'small' | 'medium' | 'large';

// Padding variants (used by Card and potentially other components)
export type PaddingVariant = 'none' | 'small' | 'medium' | 'large';