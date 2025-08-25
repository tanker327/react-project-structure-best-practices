import 'reflect-metadata';
import { z } from 'zod';
import { ApiError } from '../api/errorHandler';

/**
 * Method decorator for automatic error handling in service methods
 * @param operation Optional operation name override (defaults to method name)
 * @returns Method decorator
 */
export function HandleError(operation?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const operationName = operation || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      try {
        // Call the original method
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        // Handle the error with context
        throw handleServiceError(error, {
          operation: operationName,
          method: propertyKey,
          service: target.constructor.name,
          args: sanitizeArgs(args)
        });
      }
    };

    return descriptor;
  };
}

/**
 * Class decorator that automatically applies error handling to all async methods
 * @param serviceName The name of the service for error context
 * @returns Class decorator
 */
export function ServiceErrorHandler(serviceName: string) {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    const prototype = constructor.prototype;
    
    // Get all property names
    Object.getOwnPropertyNames(prototype).forEach(propertyName => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
      
      // Skip constructor and non-methods
      if (propertyName === 'constructor' || !descriptor || typeof descriptor.value !== 'function') {
        return;
      }
      
      // Check if it's an async method or returns a promise
      const method = descriptor.value;
      if (method.constructor.name === 'AsyncFunction' || 
          (method.toString().includes('return') && method.toString().includes('Promise'))) {
        
        // Apply the HandleError decorator
        const decoratedDescriptor = HandleError(`${serviceName}.${propertyName}`)(
          prototype,
          propertyName,
          descriptor
        );
        
        Object.defineProperty(prototype, propertyName, decoratedDescriptor);
      }
    });
    
    return constructor;
  };
}

/**
 * Parameter decorator to mark sensitive parameters that shouldn't be logged
 */
export function Sensitive(target: any, propertyKey: string | symbol, parameterIndex: number) {
  const existingMetadata = Reflect.getMetadata('sensitive:params', target, propertyKey) || [];
  existingMetadata.push(parameterIndex);
  Reflect.defineMetadata('sensitive:params', existingMetadata, target, propertyKey);
}

/**
 * Handles service-level errors and enriches them with context
 */
function handleServiceError(error: unknown, context: Record<string, any>): ApiError {
  // If it's already an ApiError, enrich it with additional context
  if (error instanceof ApiError) {
    return new ApiError(
      `Failed in ${context.operation}: ${error.message}`,
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
 * Sanitizes arguments to remove sensitive data before logging
 */
function sanitizeArgs(args: any[]): any[] {
  return args.map(arg => {
    // Remove sensitive fields like passwords, tokens, etc.
    if (typeof arg === 'object' && arg !== null) {
      const sanitized = { ...arg };
      const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
      
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      });
      
      return sanitized;
    }
    return arg;
  });
}

/**
 * Custom decorator for methods that need specific error messages
 */
export function CustomErrorMessage(getMessage: (error: any, context: any) => string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const context = {
          operation: `${target.constructor.name}.${propertyKey}`,
          method: propertyKey,
          service: target.constructor.name,
          args: sanitizeArgs(args)
        };
        
        if (error instanceof ApiError) {
          error.message = getMessage(error, context);
        }
        
        throw error;
      }
    };

    return descriptor;
  };
}