# Services Layer Architecture Guide

## Overview

The services layer creates a **centralized API abstraction layer** that separates HTTP concerns from business logic. This architecture ensures components focus on UI while services handle all API communication complexity.

## Architecture Structure

```
services/
├── endpoints.ts           # API endpoint constants (centralized)
├── api/                   # Core API infrastructure
│   ├── client.ts         # Axios configuration & HTTP methods
│   ├── interceptors.ts   # Request/response interceptors
│   ├── errorHandler.ts   # Centralized error handling
│   └── types.ts          # Generic API types
├── decorators/            # Error handling decorators
│   └── errorHandler.decorator.ts  # @HandleError & @ServiceErrorHandler
├── auth/
│   └── authService.ts    # Authentication business methods
├── products/
│   └── productService.ts # Product business methods
├── users/
│   └── userService.ts    # User business methods
└── utils/
    └── serviceErrorHandler.ts  # Utility error handling functions
```

## Core API Infrastructure

### 1. API Client (`services/api/client.ts`)

Provides generic HTTP methods with common configuration:

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { setupInterceptors } from './interceptors';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setupInterceptors(this.client);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      // Error is already handled by interceptors, just re-throw
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
```

### 2. API Endpoints (`services/endpoints.ts`)

Centralized endpoint definitions at the services level for easy access by all service modules:

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  }
} as const;
```

### 3. Interceptors (`services/api/interceptors.ts`)

Automatic request/response handling:

```typescript
import { AxiosInstance } from 'axios';
import { ecosystem } from '@/ecosystem/ecosystem';
import { authStateAtom } from '@/atoms/auth/authAtoms';

export const setupInterceptors = (client: AxiosInstance) => {
  // Request interceptor - adds auth tokens automatically
  client.interceptors.request.use(
    (config) => {
      const authState = ecosystem.getInstance(authStateAtom).getState();
      
      if (authState.accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${authState.accessToken}`;
      }

      // Add request ID for tracing
      config.headers['X-Request-ID'] = crypto.randomUUID();
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handles common error cases
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired - attempt refresh
        const authActions = ecosystem.getInstance(authStateAtom).getActions();
        await authActions.refreshToken();
      }
      
      return Promise.reject(error);
    }
  );
};
```

## Domain-Specific Services

### Product Service Example

```typescript
// src/services/products/productService.ts
import { z } from 'zod';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../endpoints';
import { productSchema } from '@/schemas/product.schemas';
import type { Product } from '@/types/product.types';
import { HandleError, ServiceErrorHandler } from '../decorators/errorHandler.decorator';

const getProductsRequestSchema = z.object({
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  search: z.string().optional(),
});

const getProductsResponseSchema = z.object({
  items: z.array(productSchema),
  total: z.number(),
  timestamp: z.string(),
});

type GetProductsRequest = z.infer<typeof getProductsRequestSchema>;
type GetProductsResponse = z.infer<typeof getProductsResponseSchema>;
type CreateProductRequest = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProductRequest = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;

@ServiceErrorHandler('ProductService')
class ProductService {
  // Business method: "Get products with optional filtering"
  @HandleError()
  async getProducts(filters?: GetProductsRequest): Promise<Product[]> {
    // Input validation using Zod
    const validatedFilters = filters 
      ? getProductsRequestSchema.parse(filters) 
      : undefined;

    // HTTP call - no try-catch needed due to @HandleError decorator
    const response = await apiClient.get<GetProductsResponse>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: validatedFilters }
    );

    // Output validation and return items array
    const validatedResponse = getProductsResponseSchema.parse(response);
    return validatedResponse.items;
  }

  // Business method: "Get a specific product"
  @HandleError()
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );

    return productSchema.parse(response);
  }

  // Business method: "Search products by query"
  @HandleError()
  async searchProducts(search: string): Promise<Product[]> {
    return this.getProducts({ search });
  }

  // Business method: "Create a new product"
  @HandleError()
  async createProduct(product: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      product
    );
    
    return productSchema.parse(response);
  }

  // Business method: "Update a product"
  @HandleError()
  async updateProduct(id: string, updates: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.patch<Product>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      updates
    );
    
    return productSchema.parse(response);
  }

  // Business method: "Delete a product"
  @HandleError()
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }

  // Complex business logic method
  @HandleError()
  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.getProducts({ category });
  }
}

export const productService = new ProductService();
```

### Authentication Service Example

```typescript
// src/services/auth/authService.ts
import { z } from 'zod';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../endpoints';
import { setAuthToken } from '../api/interceptors';
import { loginRequestSchema } from '@/schemas/auth.schemas';
import type { LoginRequest } from '@/types/auth.types';
import { HandleError, ServiceErrorHandler } from '../decorators/errorHandler.decorator';

const loginResponseSchema = z.object({
  token: z.string(),
});

type LoginResponse = z.infer<typeof loginResponseSchema>;

@ServiceErrorHandler('AuthService')
class AuthService {
  @HandleError()
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const validatedCredentials = loginRequestSchema.parse(credentials);
    
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      validatedCredentials
    );

    const validatedResponse = loginResponseSchema.parse(response);
    
    // Store token and set in interceptors
    this.storeToken(validatedResponse.token);
    setAuthToken(validatedResponse.token);
    
    return validatedResponse;
  }

  @HandleError()
  async logout(): Promise<void> {
    // Clean up local tokens and interceptor
    this.clearToken();
    setAuthToken(null);
  }

  // Helper methods for token management
  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
```

## Decorator-Based Error Handling

This project uses TypeScript decorators for elegant error handling, eliminating repetitive try-catch blocks:

### Error Handling Decorators

```typescript
// src/services/decorators/errorHandler.decorator.ts
import 'reflect-metadata';

// Method-level decorator
export function HandleError(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        // Enhanced error with service context
        const enhancedError = createEnhancedError(error, {
          service: target.constructor.name,
          method: propertyKey,
          operation: operationName || `${target.constructor.name}.${propertyKey}`,
          args: sanitizeArgs(args)
        });
        throw enhancedError;
      }
    };
  };
}

// Class-level decorator for automatic error handling
export function ServiceErrorHandler(serviceName: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Auto-apply @HandleError to all async methods
    return class extends constructor {
      // Implementation handles method decoration automatically
    };
  };
}
```

### Benefits of Decorator Pattern

1. **Clean Business Logic**: Methods focus purely on business operations
2. **Consistent Error Handling**: Automatic error context injection
3. **Reduced Boilerplate**: No repetitive try-catch blocks
4. **Type Safety**: Full TypeScript support with metadata

### Before vs After Comparison

**Before (Manual Error Handling)**:
```typescript
class ProductService {
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
          { ...error.details, operation: 'ProductService.getProducts', filters }
        );
      }
      if (error instanceof z.ZodError) {
        throw new ApiError(
          'Invalid response format from server',
          0,
          'VALIDATION_ERROR',
          { zodError: error.errors, operation: 'ProductService.getProducts' }
        );
      }
      throw error;
    }
  }
}
```

**After (With Decorators)**:
```typescript
@ServiceErrorHandler('ProductService')
class ProductService {
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
}
```

**Result**: 20+ lines of boilerplate reduced to 2 decorators, with automatic error context injection and consistent handling.

## Key Benefits

### 1. Clean Abstraction

Components use business methods instead of HTTP details:

```typescript
// ❌ Bad: Component knows about HTTP
const ProductList = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    axios.get('/api/products?category=electronics&sort=price')
      .then(response => setProducts(response.data.items))
      .catch(error => console.error(error));
  }, []);
  
  return <div>{/* render products */}</div>;
};

// ✅ Good: Component uses business methods
const ProductList = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    productService.getProducts({ category: 'electronics', sortBy: 'price' })
      .then(setProducts)
      .catch(handleError);
  }, []);
  
  return <div>{/* render products */}</div>;
};
```

### 2. Automatic Validation

Every service method validates inputs and outputs using Zod schemas:

```typescript
// Service automatically validates this data
const newProduct = await productService.createProduct({
  name: "Invalid Product",
  price: -50, // ❌ This will be caught by Zod validation
  category: "electronics"
});
```

### 3. Centralized Error Handling

```typescript
// src/services/api/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

// In interceptors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new ApiError(
        error.response.data.message,
        error.response.status,
        error.response.data.code,
        error.response.data.details
      );
    }
    throw error;
  }
);
```

### 4. Easy Testing

Services can be easily mocked:

```typescript
// tests/mocks/productService.mock.ts
export const mockProductService = {
  getProducts: jest.fn(),
  getProductById: jest.fn(),
  createProduct: jest.fn(),
  // ... other methods
};

// In component tests
jest.mock('@/services/products/productService', () => ({
  productService: mockProductService
}));
```

### 5. Integration with State Management

Services work seamlessly with Zedux atoms:

```typescript
// src/atoms/products/productsAtoms.ts
export const productsAtom = atom('products', () => {
  const store = injectStore({
    items: [] as Product[],
    loading: false,
    error: null as string | null
  });

  const loadProducts = async (filters?: GetProductsRequest) => {
    store.setState(state => ({ ...state, loading: true, error: null }));
    
    try {
      const response = await productService.getProducts(filters);
      store.setState({ 
        items: response.items, 
        loading: false, 
        error: null 
      });
    } catch (error) {
      store.setState(state => ({ 
        ...state, 
        loading: false, 
        error: error.message 
      }));
    }
  };

  return { store, loadProducts };
});
```

## Service Pattern Guidelines

### 1. Business-Focused Methods
- Method names describe **what** you want to achieve, not **how**
- `getProducts()` not `makeGetRequest()`
- `searchProducts()` not `callSearchEndpoint()`

### 2. Always Validate
- Validate inputs with Zod schemas
- Validate outputs to ensure API contract compliance
- Throw meaningful errors for invalid data

### 3. Handle Edge Cases
- Network failures
- Invalid responses
- Authentication issues
- Rate limiting

### 4. Keep Services Stateless
- Services should not store application state
- Use atoms for state management
- Services only handle data fetching and transformation

### 5. Single Responsibility
- Each service handles one domain (products, auth, users)
- Keep methods focused and cohesive
- Extract complex business logic into separate utility functions

## Best Practices

1. **Use TypeScript decorators** - Enable `experimentalDecorators` and `emitDecoratorMetadata` in tsconfig.json
2. **Apply error handling decorators** - Use `@ServiceErrorHandler` for classes and `@HandleError` for specific methods
3. **Use TypeScript strictly** - Define precise types for all requests/responses
4. **Validate with Zod schemas** - Input and output validation for type safety
5. **Keep services stateless** - Use atoms for state management, services only handle data operations
6. **Use appropriate HTTP methods** - GET, POST, PUT, PATCH, DELETE correctly
7. **Implement request/response logging** - For debugging and monitoring via interceptors
8. **Use environment variables** - For API URLs and configuration
9. **Test thoroughly** - Unit tests for all service methods with decorator support

## TypeScript Configuration Requirements

For decorator support, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true
  }
}
```

And install the reflection metadata package:
```bash
npm install reflect-metadata
```

Import at your application entry point:
```typescript
import 'reflect-metadata';
```

This services layer architecture ensures clean separation of concerns, automatic validation, centralized error handling, and easy testing while providing a business-focused API for your components to consume.