# API Error Handling System

This directory contains the centralized error handling system for the API layer.

## Components

### `errorHandler.ts`
- **ApiError Class**: Standardized error object with statusCode, code, and details
- **handleApiError Function**: Converts raw errors to typed ApiError instances

### `interceptors.ts`
- **Request Interceptor**: Adds authentication tokens and request IDs
- **Response Interceptor**: Converts all errors to ApiError and handles auth failures
- **Development Logging**: Detailed error logging in development mode

### `client.ts`
- **ApiClient Class**: Wrapper around axios with standardized error handling
- **Type-safe Methods**: GET, POST, PUT, PATCH, DELETE with proper TypeScript support

## Usage

### In Services
```typescript
import { ApiError } from '@/services/api/errorHandler';

try {
  const data = await apiClient.get('/products');
  return data;
} catch (error) {
  if (error instanceof ApiError) {
    // Handle typed error with status code, code, and details
    throw new ApiError(
      `Failed to fetch products: ${error.message}`,
      error.statusCode,
      error.code,
      { ...error.details, operation: 'getProducts' }
    );
  }
  throw error;
}
```

### In Components
```typescript
import { ApiError } from '@/services/api/errorHandler';

const [error, setError] = useState<string | null>(null);

try {
  const products = await productService.getProducts();
} catch (err) {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'NETWORK_ERROR':
        setError('Network error. Please check your connection.');
        break;
      case 'VALIDATION_ERROR':
        setError('Invalid data received from server.');
        break;
      default:
        setError(`Error ${err.statusCode}: ${err.message}`);
    }
  }
}
```

## Error Types

- **NETWORK_ERROR**: No response received (connection issues)
- **VALIDATION_ERROR**: Response data doesn't match expected schema
- **UNKNOWN_ERROR**: Unexpected errors
- **HTTP Status Codes**: 400, 401, 404, 500, etc.

## Features

- ✅ Standardized error format across the application
- ✅ Automatic error conversion in response interceptors
- ✅ Development-only detailed error logging
- ✅ Authentication error handling (401 redirects)
- ✅ CORS support with custom headers
- ✅ Request ID generation for tracking
- ✅ Type-safe error handling with TypeScript
- ✅ Validation error handling for API responses