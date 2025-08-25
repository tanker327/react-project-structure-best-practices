# API Endpoints Pattern - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [The Pattern](#the-pattern)
3. [Key Benefits](#key-benefits)
4. [Implementation Examples](#implementation-examples)
5. [Best Practices](#best-practices)
6. [Advanced Patterns](#advanced-patterns)
7. [Testing Strategies](#testing-strategies)
8. [Migration Guide](#migration-guide)

---

## Overview

The centralized API endpoints pattern is a crucial architectural decision for scalable React applications. This pattern involves defining all API endpoints in a single, type-safe constant object, providing a single source of truth for all HTTP communication in your application.

### Why This Pattern Matters

In large-scale applications, API endpoint management can become chaotic with endpoints scattered across service files, components, and utilities. This pattern solves that problem by centralizing all endpoint definitions in one location, making your codebase more maintainable, type-safe, and developer-friendly.

---

## The Pattern

### Basic Structure

```typescript
// src/services/api/endpoints.ts
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
    BULK_UPDATE: '/products/bulk',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: number) => `/users/${id}`,
    PROFILE: '/users/profile',
    PREFERENCES: (userId: string) => `/users/${userId}/preferences`,
    UPDATE_PREFERENCES: (userId: string) => `/users/${userId}/preferences`,
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    ITEMS: (orderId: string) => `/orders/${orderId}/items`,
    ITEM_DETAIL: (orderId: string, itemId: string) => `/orders/${orderId}/items/${itemId}`,
  }
} as const;
```

### Key Components of the Pattern

1. **Nested Object Structure**: Groups related endpoints together
2. **Static Strings**: For simple, non-parameterized endpoints
3. **Arrow Functions**: For dynamic, parameterized endpoints
4. **Type Assertions**: `as const` for deep readonly and literal types
5. **Consistent Naming**: Descriptive, action-based names

---

## Key Benefits

### 1. Centralized Source of Truth

**Problem Without Pattern:**
```typescript
// ❌ Endpoints scattered across multiple files

// In ProductService.ts
const response = await axios.get('/products');

// In ProductDetail.tsx
const product = await axios.get(`/products/${id}`);

// In AdminPanel.tsx
await axios.delete(`/products/${productId}`);

// In SearchComponent.tsx
const results = await axios.get('/products/search?q=' + query);
```

**Solution With Pattern:**
```typescript
// ✅ All endpoints in one place
export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
  }
} as const;

// Usage anywhere
await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST);
await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(productId));
await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(productId));
```

**Benefits:**
- Single location to view all available endpoints
- Easy to audit API surface area
- Quick onboarding for new developers
- Simplified documentation

### 2. Type Safety with `as const`

**Deep Readonly Protection:**
```typescript
// The 'as const' assertion makes the entire object deeply readonly
const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/products'
  }
} as const;

// TypeScript prevents mutations
API_ENDPOINTS.PRODUCTS.LIST = '/new-products'; 
// ❌ Error: Cannot assign to 'LIST' because it is a read-only property

// Literal type preservation
type ListEndpoint = typeof API_ENDPOINTS.PRODUCTS.LIST;
// Type is '/products' (literal), not string
```

**Function Parameter Type Safety:**
```typescript
// Function signatures enforce correct types
DETAIL: (id: string) => `/products/${id}`,
ITEM_DETAIL: (orderId: string, itemId: string) => `/orders/${orderId}/items/${itemId}`,

// TypeScript catches errors at compile time
API_ENDPOINTS.PRODUCTS.DETAIL(); 
// ❌ Error: Expected 1 argument, but got 0

API_ENDPOINTS.PRODUCTS.DETAIL(123); 
// ❌ Error: Argument of type 'number' is not assignable to parameter of type 'string'

API_ENDPOINTS.ORDERS.ITEM_DETAIL('order1'); 
// ❌ Error: Expected 2 arguments, but got 1

API_ENDPOINTS.PRODUCTS.DETAIL('abc'); 
// ✅ Correct usage
```

### 3. Function Pattern for Dynamic Routes

**Problem with String Concatenation:**
```typescript
// ❌ Multiple ways to make mistakes
const getProduct = (id: string) => {
  // Forgot the slash
  return axios.get('/products' + id);
  
  // Typo in endpoint
  return axios.get(`/product/${id}`);
  
  // Variable name typo
  return axios.get(`/products/${Id}`);
  
  // Wrong template literal syntax
  return axios.get('/products/$id');
};
```

**Solution with Functions:**
```typescript
// ✅ Consistent, error-free formatting
DETAIL: (id: string) => `/products/${id}`,
UPDATE: (id: string) => `/products/${id}`,
DELETE: (id: string) => `/products/${id}`,

// Usage is always consistent
const productUrl = API_ENDPOINTS.PRODUCTS.DETAIL('123');
// Always produces: '/products/123'
```

### 4. Easy Refactoring

**Scenario: Backend team changes API structure**

```typescript
// BEFORE: API v1
export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
  }
};

// AFTER: API v2 with new base path
export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/api/v2/products',
    DETAIL: (id: string) => `/api/v2/products/${id}`,
    SEARCH: '/api/v2/products/search',
  }
};

// ✅ All service calls automatically use new endpoints
// No need to search and replace across entire codebase
```

**Advanced Refactoring with Base URL:**
```typescript
const API_BASE = '/api/v2';

export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: `${API_BASE}/products`,
    DETAIL: (id: string) => `${API_BASE}/products/${id}`,
    SEARCH: `${API_BASE}/products/search`,
  },
  USERS: {
    LIST: `${API_BASE}/users`,
    DETAIL: (id: number) => `${API_BASE}/users/${id}`,
  }
};
```

### 5. Logical Grouping and Organization

**Clear Resource Organization:**
```typescript
export const API_ENDPOINTS = {
  // Authentication & Authorization
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Product Management
  PRODUCTS: {
    // CRUD Operations
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    
    // Bulk Operations
    BULK_CREATE: '/products/bulk',
    BULK_UPDATE: '/products/bulk',
    BULK_DELETE: '/products/bulk',
    
    // Search & Filter
    SEARCH: '/products/search',
    FILTER: '/products/filter',
    CATEGORIES: '/products/categories',
    
    // Related Resources
    REVIEWS: (productId: string) => `/products/${productId}/reviews`,
    IMAGES: (productId: string) => `/products/${productId}/images`,
  },
  
  // User Management
  USERS: {
    // User Operations
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    
    // Preferences & Settings
    PREFERENCES: (userId: string) => `/users/${userId}/preferences`,
    SETTINGS: (userId: string) => `/users/${userId}/settings`,
    
    // Related Data
    ORDERS: (userId: string) => `/users/${userId}/orders`,
    ADDRESSES: (userId: string) => `/users/${userId}/addresses`,
  }
};
```

### 6. Prevention of URL Typos and Inconsistencies

**Common Mistakes Without Pattern:**
```typescript
// ❌ Different developers write URLs differently

// Developer A: With trailing slash
await axios.get('/products/');

// Developer B: Without trailing slash
await axios.get('/products');

// Developer C: Missing leading slash
await axios.get('products');

// Developer D: Wrong case
await axios.get('/Products');

// Developer E: Typo
await axios.get('/prodcuts');
```

**Consistency With Pattern:**
```typescript
// ✅ Everyone uses the same constant
await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST);
// Always produces the exact same URL
```

### 7. Superior IDE Support

**Autocomplete and IntelliSense:**
```typescript
// As you type, IDE provides suggestions:

API_ENDPOINTS.
// IDE shows: AUTH, PRODUCTS, USERS, ORDERS

API_ENDPOINTS.PRODUCTS.
// IDE shows: LIST, DETAIL, CREATE, UPDATE, DELETE, SEARCH, etc.

API_ENDPOINTS.PRODUCTS.DE
// IDE autocompletes: DETAIL, DELETE

// With JSDoc comments for better documentation
export const API_ENDPOINTS = {
  PRODUCTS: {
    /** Get paginated list of products */
    LIST: '/products',
    
    /** Get single product by ID */
    DETAIL: (id: string) => `/products/${id}`,
    
    /** Search products by query string */
    SEARCH: '/products/search',
  }
};
```

### 8. Simplified Testing and Mocking

**Easy to Mock for Tests:**
```typescript
// __mocks__/endpoints.mock.ts
export const mockEndpoints = {
  PRODUCTS: {
    LIST: '/test/products',
    DETAIL: (id: string) => `/test/products/${id}`,
  }
};

// In test files
jest.mock('@/services/api/endpoints', () => ({
  API_ENDPOINTS: mockEndpoints
}));

// Or mock specific endpoints
beforeEach(() => {
  jest.spyOn(API_ENDPOINTS.PRODUCTS, 'LIST', 'get')
    .mockReturnValue('/mocked/products');
});
```

**Environment-Specific Endpoints:**
```typescript
const getEndpoints = () => {
  const baseUrl = process.env.NODE_ENV === 'test' 
    ? 'http://localhost:3001'
    : process.env.VITE_API_BASE_URL;

  return {
    PRODUCTS: {
      LIST: `${baseUrl}/products`,
      DETAIL: (id: string) => `${baseUrl}/products/${id}`,
    }
  };
};

export const API_ENDPOINTS = getEndpoints() as const;
```

### 9. Documentation and Discovery

**Self-Documenting Code:**
```typescript
// New developer can immediately see all available endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    // ... all auth endpoints visible
  },
  PRODUCTS: {
    // ... all product endpoints visible
  },
  USERS: {
    // ... all user endpoints visible
  },
  // Entire API surface area in one file
} as const;

// Can generate documentation automatically
Object.entries(API_ENDPOINTS).forEach(([resource, endpoints]) => {
  console.log(`${resource} Endpoints:`);
  Object.entries(endpoints).forEach(([name, endpoint]) => {
    console.log(`  ${name}: ${typeof endpoint === 'function' ? 'Dynamic' : endpoint}`);
  });
});
```

### 10. Version Management

**Supporting Multiple API Versions:**
```typescript
// endpoints.v1.ts
export const API_V1_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
  }
};

// endpoints.v2.ts
export const API_V2_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/api/v2/products',
    DETAIL: (id: string) => `/api/v2/products/${id}`,
    // New endpoint in v2
    BATCH: '/api/v2/products/batch',
  }
};

// endpoints.ts - Main export with version control
import { API_V1_ENDPOINTS } from './endpoints.v1';
import { API_V2_ENDPOINTS } from './endpoints.v2';

const useV2 = localStorage.getItem('useApiV2') === 'true';

export const API_ENDPOINTS = useV2 ? API_V2_ENDPOINTS : API_V1_ENDPOINTS;
```

---

## Implementation Examples

### Basic Service Implementation

```typescript
// src/services/products/productService.ts
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { Product, GetProductsRequest, GetProductsResponse } from '@/types/products';

class ProductService {
  /**
   * Get paginated list of products
   */
  async getProducts(filters?: GetProductsRequest): Promise<GetProductsResponse> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { 
      params: filters 
    });
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  }

  /**
   * Create new product
   */
  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    return apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data);
  }

  /**
   * Update existing product
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }

  /**
   * Search products
   */
  async searchProducts(query: string, filters?: GetProductsRequest): Promise<GetProductsResponse> {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.SEARCH, {
      params: { q: query, ...filters }
    });
  }
}

export const productService = new ProductService();
```

### Complex Nested Endpoints

```typescript
export const API_ENDPOINTS = {
  ORDERS: {
    // Order CRUD
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
    
    // Order Actions
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    REFUND: (id: string) => `/orders/${id}/refund`,
    SHIP: (id: string) => `/orders/${id}/ship`,
    DELIVER: (id: string) => `/orders/${id}/deliver`,
    
    // Nested Resources
    ITEMS: {
      LIST: (orderId: string) => `/orders/${orderId}/items`,
      ADD: (orderId: string) => `/orders/${orderId}/items`,
      UPDATE: (orderId: string, itemId: string) => `/orders/${orderId}/items/${itemId}`,
      DELETE: (orderId: string, itemId: string) => `/orders/${orderId}/items/${itemId}`,
    },
    
    // Related Data
    HISTORY: (id: string) => `/orders/${id}/history`,
    TRACKING: (id: string) => `/orders/${id}/tracking`,
    INVOICE: (id: string) => `/orders/${id}/invoice`,
  }
} as const;

// Usage
await apiClient.post(API_ENDPOINTS.ORDERS.ITEMS.ADD(orderId), itemData);
await apiClient.delete(API_ENDPOINTS.ORDERS.ITEMS.DELETE(orderId, itemId));
```

### With Query Parameters

```typescript
export const API_ENDPOINTS = {
  PRODUCTS: {
    // Base endpoint with common query params handled by service
    LIST: '/products',
    
    // Or include common query params in the function
    LIST_WITH_PARAMS: (page: number = 1, limit: number = 20) => 
      `/products?page=${page}&limit=${limit}`,
    
    // Complex query string builder
    SEARCH: (params: { query: string; category?: string; minPrice?: number }) => {
      const queryParams = new URLSearchParams();
      queryParams.append('q', params.query);
      if (params.category) queryParams.append('category', params.category);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      return `/products/search?${queryParams.toString()}`;
    },
  }
} as const;
```

---

## Best Practices

### 1. Naming Conventions

```typescript
export const API_ENDPOINTS = {
  RESOURCES: {
    // Use descriptive action-based names
    LIST: '/resources',           // Get all
    DETAIL: (id) => `/resources/${id}`,  // Get one
    CREATE: '/resources',          // Post new
    UPDATE: (id) => `/resources/${id}`,  // Put/Patch existing
    DELETE: (id) => `/resources/${id}`,  // Delete
    
    // Specific actions
    SEARCH: '/resources/search',
    FILTER: '/resources/filter',
    EXPORT: '/resources/export',
    IMPORT: '/resources/import',
    
    // Status changes
    ACTIVATE: (id) => `/resources/${id}/activate`,
    DEACTIVATE: (id) => `/resources/${id}/deactivate`,
    ARCHIVE: (id) => `/resources/${id}/archive`,
  }
};
```

### 2. Parameter Type Safety

```typescript
// Always specify parameter types explicitly
export const API_ENDPOINTS = {
  USERS: {
    // ✅ Good: Explicit types
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE_AGE: (id: string, age: number) => `/users/${id}/age/${age}`,
    
    // ❌ Bad: No type annotations
    // DETAIL: (id) => `/users/${id}`,
  },
  
  // For complex parameters, use objects
  REPORTS: {
    GENERATE: (params: {
      startDate: string;
      endDate: string;
      format: 'pdf' | 'excel' | 'csv';
    }) => `/reports/generate?start=${params.startDate}&end=${params.endDate}&format=${params.format}`,
  }
};
```

### 3. Organizing Large Endpoint Collections

```typescript
// For very large APIs, consider splitting by domain
// endpoints/index.ts
export { AUTH_ENDPOINTS } from './auth.endpoints';
export { PRODUCT_ENDPOINTS } from './product.endpoints';
export { USER_ENDPOINTS } from './user.endpoints';
export { ORDER_ENDPOINTS } from './order.endpoints';

// Combine into single object if needed
import { AUTH_ENDPOINTS } from './auth.endpoints';
import { PRODUCT_ENDPOINTS } from './product.endpoints';

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  PRODUCTS: PRODUCT_ENDPOINTS,
  // ...
} as const;
```

### 4. Documentation

```typescript
/**
 * API Endpoints Configuration
 * 
 * Centralized definition of all API endpoints used in the application.
 * Uses functions for parameterized routes to ensure type safety.
 */
export const API_ENDPOINTS = {
  /**
   * Authentication endpoints
   */
  AUTH: {
    /** POST: User login with email/password */
    LOGIN: '/auth/login',
    
    /** POST: Register new user account */
    REGISTER: '/auth/register',
    
    /** POST: Refresh access token using refresh token */
    REFRESH: '/auth/refresh',
  },
  
  /**
   * Product management endpoints
   */
  PRODUCTS: {
    /** GET: Retrieve paginated product list */
    LIST: '/products',
    
    /** 
     * GET: Retrieve single product details
     * @param id - Product unique identifier
     */
    DETAIL: (id: string) => `/products/${id}`,
  }
} as const;
```

### 5. Environment-Specific Configuration

```typescript
// endpoints.config.ts
const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.VITE_ENV === 'staging';

const getApiBase = () => {
  if (isDevelopment) return 'http://localhost:3000/api';
  if (isStaging) return 'https://staging-api.example.com';
  return 'https://api.example.com';
};

const API_BASE = getApiBase();

export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: `${API_BASE}/products`,
    DETAIL: (id: string) => `${API_BASE}/products/${id}`,
  }
} as const;
```

---

## Advanced Patterns

### 1. Endpoint Builder Pattern

```typescript
class EndpointBuilder {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  crud(resourceName: string) {
    const resource = `${this.basePath}/${resourceName}`;
    return {
      LIST: resource,
      DETAIL: (id: string) => `${resource}/${id}`,
      CREATE: resource,
      UPDATE: (id: string) => `${resource}/${id}`,
      DELETE: (id: string) => `${resource}/${id}`,
    };
  }

  nested(parentResource: string, childResource: string) {
    return {
      LIST: (parentId: string) => 
        `${this.basePath}/${parentResource}/${parentId}/${childResource}`,
      DETAIL: (parentId: string, childId: string) => 
        `${this.basePath}/${parentResource}/${parentId}/${childResource}/${childId}`,
    };
  }
}

const builder = new EndpointBuilder('/api/v1');

export const API_ENDPOINTS = {
  PRODUCTS: builder.crud('products'),
  USERS: builder.crud('users'),
  USER_ADDRESSES: builder.nested('users', 'addresses'),
} as const;
```

### 2. Type-Safe Endpoint Factory

```typescript
type EndpointConfig<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K]
    : string;
};

function createEndpoints<T extends Record<string, any>>(
  config: EndpointConfig<T>
): Readonly<T> {
  return Object.freeze(config) as Readonly<T>;
}

export const API_ENDPOINTS = createEndpoints({
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}` as const,
    SEARCH: (query: string) => `/products/search?q=${query}` as const,
  }
});
```

### 3. GraphQL Integration

```typescript
export const API_ENDPOINTS = {
  REST: {
    PRODUCTS: {
      LIST: '/api/products',
      DETAIL: (id: string) => `/api/products/${id}`,
    }
  },
  GRAPHQL: {
    ENDPOINT: '/graphql',
    SUBSCRIPTIONS: 'wss://api.example.com/graphql',
  }
} as const;
```

---

## Testing Strategies

### Unit Testing Services

```typescript
// productService.test.ts
import { productService } from './productService';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

jest.mock('../api/client');

describe('ProductService', () => {
  it('should call correct endpoint for getProducts', async () => {
    const mockProducts = [{ id: '1', name: 'Product 1' }];
    (apiClient.get as jest.Mock).mockResolvedValue({ items: mockProducts });

    const result = await productService.getProducts();

    expect(apiClient.get).toHaveBeenCalledWith(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: undefined }
    );
    expect(result.items).toEqual(mockProducts);
  });

  it('should call correct endpoint for getProductById', async () => {
    const productId = '123';
    const mockProduct = { id: productId, name: 'Product 123' };
    (apiClient.get as jest.Mock).mockResolvedValue(mockProduct);

    const result = await productService.getProductById(productId);

    expect(apiClient.get).toHaveBeenCalledWith(
      API_ENDPOINTS.PRODUCTS.DETAIL(productId)
    );
    expect(result).toEqual(mockProduct);
  });
});
```

### Integration Testing

```typescript
// endpoints.integration.test.ts
import { API_ENDPOINTS } from '../endpoints';

describe('API Endpoints Integration', () => {
  it('should generate correct URLs for product endpoints', () => {
    expect(API_ENDPOINTS.PRODUCTS.LIST).toBe('/products');
    expect(API_ENDPOINTS.PRODUCTS.DETAIL('123')).toBe('/products/123');
    expect(API_ENDPOINTS.PRODUCTS.UPDATE('456')).toBe('/products/456');
  });

  it('should handle complex nested endpoints', () => {
    const orderId = 'order123';
    const itemId = 'item456';
    
    expect(API_ENDPOINTS.ORDERS.ITEMS.UPDATE(orderId, itemId))
      .toBe(`/orders/${orderId}/items/${itemId}`);
  });

  it('should maintain type safety', () => {
    // This should cause TypeScript error if types are wrong
    // @ts-expect-error - Testing type safety
    expect(() => API_ENDPOINTS.PRODUCTS.DETAIL()).toThrow();
    
    // @ts-expect-error - Testing type safety
    expect(() => API_ENDPOINTS.PRODUCTS.DETAIL(123)).toThrow();
  });
});
```

---

## Migration Guide

### Step 1: Audit Existing Endpoints

```typescript
// 1. Search for all axios/fetch calls in your codebase
// 2. Document all unique endpoints
// 3. Group them by resource/domain

// Example findings:
// - /products (GET)
// - /products/:id (GET, PUT, DELETE)
// - /products/search (GET)
// - /auth/login (POST)
// - /auth/logout (POST)
```

### Step 2: Create Endpoints Configuration

```typescript
// src/services/api/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
  }
} as const;
```

### Step 3: Update Services

```typescript
// BEFORE
class ProductService {
  async getProducts() {
    return axios.get('/products');
  }
  
  async getProduct(id: string) {
    return axios.get(`/products/${id}`);
  }
}

// AFTER
import { API_ENDPOINTS } from '../api/endpoints';

class ProductService {
  async getProducts() {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.LIST);
  }
  
  async getProduct(id: string) {
    return apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  }
}
```

### Step 4: Update Components

```typescript
// BEFORE
const ProductList = () => {
  useEffect(() => {
    fetch('/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);
};

// AFTER
const ProductList = () => {
  useEffect(() => {
    productService.getProducts()
      .then(setProducts);
  }, []);
};
```

### Step 5: Add Tests

```typescript
// Add tests to ensure endpoints generate correct URLs
describe('Endpoint Migration Tests', () => {
  it('should match legacy endpoint URLs', () => {
    // Test that new endpoints match old URLs
    expect(API_ENDPOINTS.PRODUCTS.LIST).toBe('/products');
    expect(API_ENDPOINTS.PRODUCTS.DETAIL('123')).toBe('/products/123');
  });
});
```

---

## Conclusion

The centralized API endpoints pattern is a fundamental architectural decision that provides:

1. **Single Source of Truth**: All endpoints in one location
2. **Type Safety**: Full TypeScript support with compile-time checking
3. **Maintainability**: Easy refactoring and updates
4. **Consistency**: Uniform endpoint usage across the application
5. **Developer Experience**: Better IDE support and discoverability
6. **Testing**: Simplified mocking and testing strategies
7. **Documentation**: Self-documenting code structure
8. **Scalability**: Pattern grows well with application size

This pattern is essential for building maintainable, scalable React applications with TypeScript. It reduces errors, improves developer productivity, and makes the codebase more professional and enterprise-ready.

### Key Takeaways

- Always use `as const` for type safety
- Use functions for parameterized endpoints
- Group endpoints logically by resource
- Keep endpoint definitions close to their usage (in the services layer)
- Document complex endpoints
- Consider environment-specific configurations
- Test endpoint generation to prevent regressions

By following this pattern, your team will have a robust, type-safe foundation for all API communication in your React application.