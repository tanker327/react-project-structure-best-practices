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
├── auth/
│   └── authService.ts    # Authentication business methods
├── products/
│   └── productService.ts # Product business methods
├── users/
│   └── userService.ts    # User business methods
└── orders/
    └── orderService.ts   # Order business methods
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
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
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
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../endpoints';
import { 
  GetProductsRequest, 
  GetProductsResponse,
  CreateProductRequest,
  UpdateProductRequest,
  Product 
} from '@/types/products/product.api';
import { 
  getProductsRequestSchema, 
  getProductsResponseSchema,
  createProductRequestSchema,
  productSchema 
} from '@/schemas/product.schemas';

class ProductService {
  // Business method: "Get products with optional filtering"
  async getProducts(filters?: GetProductsRequest): Promise<GetProductsResponse> {
    // Input validation using Zod
    const validatedFilters = filters 
      ? getProductsRequestSchema.parse(filters) 
      : undefined;

    // HTTP call
    const response = await apiClient.get<GetProductsResponse>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: validatedFilters }
    );

    // Output validation
    return getProductsResponseSchema.parse(response);
  }

  // Business method: "Get a specific product"
  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );

    return productSchema.parse(response);
  }

  // Business method: "Search products by query"
  async searchProducts(query: string, filters?: GetProductsRequest): Promise<GetProductsResponse> {
    const searchParams = {
      q: query,
      ...filters
    };

    const response = await apiClient.get<GetProductsResponse>(
      API_ENDPOINTS.PRODUCTS.SEARCH,
      { params: searchParams }
    );

    return getProductsResponseSchema.parse(response);
  }

  // Business method: "Create a new product"
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const validatedData = createProductRequestSchema.parse(productData);

    const response = await apiClient.post<Product>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      validatedData
    );

    return productSchema.parse(response);
  }

  // Complex business logic method
  async getProductsWithInventory(categoryId?: string): Promise<Product[]> {
    const filters = {
      category: categoryId,
      includeInventory: true,
      onlyInStock: true
    };

    const response = await this.getProducts(filters);
    
    // Additional business logic
    return response.items.filter(product => product.inventory > 0);
  }
}

export const productService = new ProductService();
```

### Authentication Service Example

```typescript
// src/services/auth/authService.ts
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../endpoints';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  RefreshTokenResponse 
} from '@/types/auth/auth.api';
import { loginRequestSchema, registerRequestSchema } from '@/schemas/auth.schemas';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const validatedCredentials = loginRequestSchema.parse(credentials);
    
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      validatedCredentials
    );

    // Store token in a secure way
    this.storeTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const validatedData = registerRequestSchema.parse(userData);
    
    return await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      validatedData
    );
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Always clean up local tokens, even if API call fails
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    this.storeTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  // Helper methods for token management
  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export const authService = new AuthService();
```

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

1. **Use TypeScript strictly** - Define precise types for all requests/responses
2. **Implement proper error handling** - Convert HTTP errors to business errors
3. **Add retry logic** - For transient failures
4. **Use appropriate HTTP methods** - GET, POST, PUT, DELETE correctly
5. **Implement request/response logging** - For debugging and monitoring
6. **Cache when appropriate** - For frequently accessed data
7. **Use environment variables** - For API URLs and configuration
8. **Test thoroughly** - Unit tests for all service methods

This services layer architecture ensures clean separation of concerns, automatic validation, centralized error handling, and easy testing while providing a business-focused API for your components to consume.