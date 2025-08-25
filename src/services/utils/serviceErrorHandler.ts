import { z } from 'zod';
import { ApiError } from '../api/errorHandler';

interface ErrorContext {
  operation: string;
  [key: string]: any;
}

/**
 * Wraps a service method with standardized error handling
 * @param fn The async function to wrap
 * @param operation The operation name for error context
 * @returns The wrapped function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operation: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleServiceError(error, { operation, args });
    }
  }) as T;
}

/**
 * Handles service-level errors and enriches them with context
 * @param error The caught error
 * @param context Additional context for the error
 * @returns An enriched ApiError
 */
export function handleServiceError(error: unknown, context: ErrorContext): ApiError {
  // If it's already an ApiError, enrich it with additional context
  if (error instanceof ApiError) {
    return new ApiError(
      `Failed to ${context.operation}: ${error.message}`,
      error.statusCode,
      error.code,
      { ...error.details, ...context }
    );
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return new ApiError(
      `Validation error in ${context.operation}`,
      0,
      'VALIDATION_ERROR',
      { 
        zodError: error.errors, 
        ...context 
      }
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    return new ApiError(
      `Error in ${context.operation}: ${error.message}`,
      0,
      'UNKNOWN_ERROR',
      context
    );
  }

  // Fallback for unknown error types
  return new ApiError(
    `Unknown error in ${context.operation}`,
    0,
    'UNKNOWN_ERROR',
    { error, ...context }
  );
}

/**
 * Creates a service method wrapper with automatic error handling
 * @param serviceName The name of the service (e.g., "ProductService")
 * @returns A function that wraps service methods with error handling
 */
export function createServiceWrapper(serviceName: string) {
  return function wrapMethod<T extends (...args: any[]) => Promise<any>>(
    methodName: string,
    fn: T
  ): T {
    return withErrorHandling(fn, `${serviceName}.${methodName}`);
  };
}

/**
 * Decorator-style wrapper for async service methods
 * Usage: await handleErrors('operationName', async () => { ... })
 */
export async function handleErrors<T>(
  operation: string,
  fn: () => Promise<T>,
  additionalContext?: Record<string, any>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw handleServiceError(error, { operation, ...additionalContext });
  }
}