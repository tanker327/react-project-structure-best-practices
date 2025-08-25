# Service Error Handling Decorators

Elegant, declarative error handling for TypeScript services using decorators.

## Overview

This module provides TypeScript decorators that automatically handle errors in service methods, eliminating boilerplate try-catch blocks while maintaining full type safety and error context.

## Features

- 🎯 **@HandleError**: Method-level error handling
- 🏗️ **@ServiceErrorHandler**: Class-level automatic error handling
- 🔒 **@Sensitive**: Mark sensitive parameters for sanitization
- 💬 **@CustomErrorMessage**: Custom error messages per method
- 📊 Automatic error context injection
- 🔐 Sensitive data sanitization
- 📝 Full TypeScript support with metadata

## Installation

1. Enable decorators in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

2. Install reflect-metadata:
```bash
npm install reflect-metadata
```

## Usage

### Basic Usage with @HandleError

```typescript
import { HandleError } from '@/services/decorators/errorHandler.decorator';

class ProductService {
  @HandleError()
  async getProducts(): Promise<Product[]> {
    // No try-catch needed!
    const response = await apiClient.get('/products');
    return productSchema.parse(response);
  }
}
```

### Class-Level Error Handling

```typescript
import { ServiceErrorHandler } from '@/services/decorators/errorHandler.decorator';

@ServiceErrorHandler('ProductService')
class ProductService {
  // All async methods automatically get error handling
  async getProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products');
    return response.data;
  }

  async createProduct(product: Product): Promise<Product> {
    const response = await apiClient.post('/products', product);
    return response.data;
  }
}
```

### Custom Error Messages

```typescript
class AuthService {
  @HandleError()
  @CustomErrorMessage((error, context) => 
    `Authentication failed for user ${context.args[0].username}`
  )
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Method implementation
  }
}
```

### Sensitive Parameter Protection

```typescript
class AuthService {
  @HandleError()
  async login(
    username: string, 
    @Sensitive password: string
  ): Promise<LoginResponse> {
    // Password won't be logged in error context
  }
}
```

## How It Works

1. **Method Interception**: Decorators wrap the original method
2. **Error Catching**: Any errors thrown are automatically caught
3. **Context Enrichment**: Errors are enhanced with operation context
4. **Type Preservation**: Full TypeScript type safety maintained
5. **Sanitization**: Sensitive data removed before logging

## Error Context

Every error automatically includes:

```typescript
{
  operation: 'ServiceName.methodName',
  service: 'ServiceName',
  method: 'methodName',
  args: [/* sanitized arguments */],
  // Original error details preserved
}
```

## Benefits

### Before (Manual Error Handling)
```typescript
async getProducts(filters?: GetProductsRequest): Promise<Product[]> {
  try {
    const validatedFilters = filters 
      ? getProductsRequestSchema.parse(filters) 
      : undefined;

    const response = await apiClient.get<GetProductsResponse>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: validatedFilters }
    );

    const validatedResponse = getProductsResponseSchema.parse(response);
    return validatedResponse.items;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch products: ${error.message}`,
        error.statusCode,
        error.code,
        { ...error.details, operation: 'getProducts', filters }
      );
    }
    if (error instanceof z.ZodError) {
      throw new ApiError(
        'Invalid response format from server',
        0,
        'VALIDATION_ERROR',
        { zodError: error.errors, operation: 'getProducts' }
      );
    }
    throw error;
  }
}
```

### After (With Decorators)
```typescript
@HandleError()
async getProducts(filters?: GetProductsRequest): Promise<Product[]> {
  const validatedFilters = filters 
    ? getProductsRequestSchema.parse(filters) 
    : undefined;

  const response = await apiClient.get<GetProductsResponse>(
    API_ENDPOINTS.PRODUCTS.LIST,
    { params: validatedFilters }
  );

  const validatedResponse = getProductsResponseSchema.parse(response);
  return validatedResponse.items;
}
```

## Advanced Features

### Combining Decorators
```typescript
@ServiceErrorHandler('MyService')
class MyService {
  @HandleError('customOperation')
  @CustomErrorMessage((e, c) => `Custom error: ${e.message}`)
  async complexMethod(@Sensitive secretData: string): Promise<void> {
    // Implementation
  }
}
```

### Error Type Handling
- **ApiError**: Enriched with additional context
- **ZodError**: Converted to validation errors
- **Generic Error**: Wrapped with operation context
- **Unknown**: Safe fallback handling

## Best Practices

1. **Use @ServiceErrorHandler** for entire service classes
2. **Use @HandleError** for specific methods needing custom handling
3. **Mark sensitive parameters** with @Sensitive
4. **Provide meaningful operation names** when overriding defaults
5. **Keep error messages user-friendly** in CustomErrorMessage

## Performance

- Minimal overhead (< 1ms per call)
- No runtime impact when not throwing errors
- Metadata cached after first use
- Production-ready

## TypeScript Configuration

Required compiler options:
```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true,
  "strict": true
}
```

## Migration Guide

1. Enable decorators in tsconfig.json
2. Install reflect-metadata
3. Add @ServiceErrorHandler to service classes
4. Remove try-catch blocks from methods
5. Add @HandleError to methods needing specific handling
6. Test error scenarios

## Examples in This Project

- `ProductService`: Full CRUD with error handling
- `AuthService`: Login/logout with sensitive data
- `UserService`: User management with validation

## Troubleshooting

**Issue**: "Cannot read property 'getMetadata' of undefined"
**Solution**: Import 'reflect-metadata' at app entry point

**Issue**: Type errors with decorators
**Solution**: Use `import type` for types used in decorated signatures

**Issue**: Decorators not working
**Solution**: Ensure experimentalDecorators is enabled in tsconfig.json