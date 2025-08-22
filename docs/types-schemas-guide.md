# Types and Schemas Organization Guide

## Overview

This guide outlines the optimal organization of TypeScript types and Zod schemas in a React application, following the principle of **high cohesion** and **separation of concerns**. The key insight is distinguishing between **universal business entities** and **service-specific API contracts**.

## Architecture Principles

### 1. **Centralized Business Entities**
- Core business schemas and types that represent domain concepts
- Used across multiple parts of the application
- Stable and rarely change due to API modifications

### 2. **Service-Specific API Contracts**
- Request/response schemas tightly coupled to specific service methods
- Defined within service files for high cohesion
- Can evolve independently without affecting business logic

## Folder Structure

```
src/
├── schemas/                    # Universal business entities only
│   ├── index.ts               # Barrel export
│   ├── common.schemas.ts      # Shared validation schemas
│   ├── product.schemas.ts     # Core product entity
│   ├── user.schemas.ts        # Core user entity
│   ├── order.schemas.ts       # Core order entity
│   └── auth.schemas.ts        # Core auth entities
│
├── types/                     # Universal business types only
│   ├── index.ts              # Barrel export
│   ├── common.types.ts       # Shared business types
│   ├── product.types.ts      # Universal product types
│   ├── user.types.ts         # Universal user types
│   ├── order.types.ts        # Universal order types
│   └── auth.types.ts         # Universal auth types
│
└── services/                 # Service-specific schemas & types
    ├── products/
    │   └── productService.ts # Contains API schemas & types
    ├── users/
    │   └── userService.ts    # Contains API schemas & types
    └── auth/
        └── authService.ts    # Contains API schemas & types
```

## Universal Business Entities (Centralized)

### Core Business Schemas

```typescript
// src/schemas/product.schemas.ts
import { z } from 'zod';

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string(),
  inventory: z.number().int().min(0),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export const inventorySchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(0),
  reservedQuantity: z.number().int().min(0),
  lastUpdated: z.string(),
});
```

```typescript
// src/schemas/user.schemas.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'user', 'manager']),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userPreferencesSchema = z.object({
  userId: z.string(),
  theme: z.enum(['light', 'dark', 'auto']),
  language: z.string(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    marketing: z.boolean(),
  }),
});
```

### Universal Business Types

```typescript
// src/types/product.types.ts
import { z } from 'zod';
import { productSchema, categorySchema, inventorySchema } from '@/schemas/product.schemas';

// Core business entities used across the app
export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Inventory = z.infer<typeof inventorySchema>;

// Universal business logic types (not API-specific)
export type ProductFilter = {
  searchQuery?: string;
  categories: string[];
  priceRange: { min: number; max: number };
  inStockOnly: boolean;
};

export type ProductSort = {
  field: keyof Pick<Product, 'name' | 'price' | 'createdAt'>;
  direction: 'asc' | 'desc';
};

export type CartItem = {
  product: Product;
  quantity: number;
  addedAt: Date;
  customizations?: Record<string, any>;
};

export type ProductWithInventory = Product & {
  inventory: Inventory;
};
```

```typescript
// src/types/user.types.ts
import { z } from 'zod';
import { userSchema, userPreferencesSchema } from '@/schemas/user.schemas';

export type User = z.infer<typeof userSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Universal business types
export type UserRole = User['role'];

export type UserProfile = User & {
  preferences: UserPreferences;
  lastLoginAt?: string;
};

export type UserSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};
```

```typescript
// src/types/order.types.ts
import { z } from 'zod';
import { orderSchema, orderItemSchema } from '@/schemas/order.schemas';
import { Product } from './product.types';

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;

export type OrderStatus = Order['status'];

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

export type OrderSummary = {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
};
```

## Service-Specific API Contracts

### Product Service Example

```typescript
// src/services/products/productService.ts
import { z } from 'zod';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

// Import universal business schema
import { productSchema } from '@/schemas/product.schemas';
// Import universal business type
import { User, UserPreferences, UserProfile } from '@/types/user.types';

// =================== SERVICE-SPECIFIC SCHEMAS ===================
// These schemas are only used by this service

const getProductsRequestSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'popularity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  includeInactive: z.boolean().default(false),
  searchQuery: z.string().optional(),
});

const getProductsResponseSchema = z.object({
  items: z.array(productSchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  }),
  filters: z.object({
    appliedFilters: z.record(z.any()),
    availableCategories: z.array(z.string()),
    priceRange: z.object({
      min: z.number(),
      max: z.number(),
    }),
  }),
});

const createProductRequestSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const updateProductRequestSchema = productSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const bulkUpdateProductsRequestSchema = z.object({
  productIds: z.array(z.string()),
  updates: updateProductRequestSchema,
});

// =================== SERVICE-SPECIFIC TYPES ===================
// These types are only used within this service

type GetProductsRequest = z.infer<typeof getProductsRequestSchema>;
type GetProductsResponse = z.infer<typeof getProductsResponseSchema>;
type CreateProductRequest = z.infer<typeof createProductRequestSchema>;
type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;
type BulkUpdateProductsRequest = z.infer<typeof bulkUpdateProductsRequestSchema>;

// =================== SERVICE IMPLEMENTATION ===================

class ProductService {
  async getProducts(request?: GetProductsRequest): Promise<GetProductsResponse> {
    const validatedRequest = request 
      ? getProductsRequestSchema.parse(request) 
      : getProductsRequestSchema.parse({});

    const response = await apiClient.get<GetProductsResponse>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: validatedRequest }
    );

    return getProductsResponseSchema.parse(response);
  }

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );

    return productSchema.parse(response);
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const validatedData = createProductRequestSchema.parse(productData);

    const response = await apiClient.post<Product>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      validatedData
    );

    return productSchema.parse(response);
  }

  async updateProduct(id: string, updates: UpdateProductRequest): Promise<Product> {
    const validatedUpdates = updateProductRequestSchema.parse(updates);

    const response = await apiClient.put<Product>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      validatedUpdates
    );

    return productSchema.parse(response);
  }

  async bulkUpdateProducts(request: BulkUpdateProductsRequest): Promise<Product[]> {
    const validatedRequest = bulkUpdateProductsRequestSchema.parse(request);

    const response = await apiClient.put<Product[]>(
      API_ENDPOINTS.PRODUCTS.BULK_UPDATE,
      validatedRequest
    );

    return z.array(productSchema).parse(response);
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }

  // Business logic methods that might use multiple API calls
  async getProductsWithLowStock(threshold: number = 10): Promise<Product[]> {
    const response = await this.getProducts({
      includeInactive: false,
      limit: 100
    });

    return response.items.filter(product => product.inventory <= threshold);
  }
}

export const productService = new ProductService();

// Only export the service - keep schemas and types internal to this file
```

### User Service Example

```typescript
// src/services/users/userService.ts
import { z } from 'zod';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

// Import universal business schemas and types
import { userSchema, userPreferencesSchema } from '@/schemas/user.schemas';
import { Product } from '@/types/product.types';

// =================== SERVICE-SPECIFIC SCHEMAS ===================

const getUsersRequestSchema = z.object({
  role: z.enum(['admin', 'user', 'manager']).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  searchQuery: z.string().optional(),
});

const getUsersResponseSchema = z.object({
  items: z.array(userSchema),
  pagination: z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  }),
});

const createUserRequestSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const updateUserRequestSchema = userSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const updateUserPreferencesRequestSchema = userPreferencesSchema.omit({
  userId: true,
});

// =================== SERVICE-SPECIFIC TYPES ===================

type GetUsersRequest = z.infer<typeof getUsersRequestSchema>;
type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;
type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
type UpdateUserPreferencesRequest = z.infer<typeof updateUserPreferencesRequestSchema>;

// =================== SERVICE IMPLEMENTATION ===================

class UserService {
  async getUsers(request?: GetUsersRequest): Promise<GetUsersResponse> {
    const validatedRequest = request 
      ? getUsersRequestSchema.parse(request) 
      : getUsersRequestSchema.parse({});

    const response = await apiClient.get<GetUsersResponse>(
      API_ENDPOINTS.USERS.LIST,
      { params: validatedRequest }
    );

    return getUsersResponseSchema.parse(response);
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(
      API_ENDPOINTS.USERS.DETAIL(id)
    );

    return userSchema.parse(response);
  }

  async getUserProfile(id: string): Promise<UserProfile> {
    const [user, preferences] = await Promise.all([
      this.getUserById(id),
      this.getUserPreferences(id)
    ]);

    return { ...user, preferences };
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const validatedData = createUserRequestSchema.parse(userData);

    const response = await apiClient.post<User>(
      API_ENDPOINTS.USERS.CREATE,
      validatedData
    );

    return userSchema.parse(response);
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    const validatedUpdates = updateUserRequestSchema.parse(updates);

    const response = await apiClient.put<User>(
      API_ENDPOINTS.USERS.UPDATE(id),
      validatedUpdates
    );

    return userSchema.parse(response);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const response = await apiClient.get<UserPreferences>(
      API_ENDPOINTS.USERS.PREFERENCES(userId)
    );

    return userPreferencesSchema.parse(response);
  }

  async updateUserPreferences(
    userId: string, 
    preferences: UpdateUserPreferencesRequest
  ): Promise<UserPreferences> {
    const validatedPreferences = updateUserPreferencesRequestSchema.parse(preferences);

    const response = await apiClient.put<UserPreferences>(
      API_ENDPOINTS.USERS.UPDATE_PREFERENCES(userId),
      validatedPreferences
    );

    return userPreferencesSchema.parse(response);
  }
}

export const userService = new UserService();
```

## Usage in Components

### The Right Way: Use Services, Not Direct HTTP

Components should call service methods instead of making direct HTTP requests:

```typescript
// ❌ BAD: Component makes direct HTTP requests
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductListBad = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Direct HTTP request with hardcoded URL and manual error handling
        const response = await axios.get('/api/products?category=electronics&sort=price');
        setProducts(response.data.items);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

```typescript
// ✅ GOOD: Component uses service methods
import React, { useState, useEffect } from 'react';
import { productService } from '@/services/products/productService';
import { Product } from '@/types/products/product.types';

const ProductListGood = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Clean business method call with automatic validation
        const response = await productService.getProducts({ 
          category: 'electronics', 
          sortBy: 'price' 
        });
        setProducts(response.items);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product: Product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

### Even Better: Use State Management (Atoms)

The best approach is to use Zedux atoms that handle service calls:

```typescript
// ✅ BEST: Component uses atoms that handle service calls
import React, { useEffect } from 'react';
import { useAtomValue, useAtomState } from '@zedux/react';

// Import universal business types
import { Product, ProductFilter } from '@/types/products/product.types';

// Import atoms that handle service calls internally
import { productsAtom, productFiltersAtom } from '@/atoms/products/productsAtoms';

export const ProductListBest = () => {
  const [productsState, productsActions] = useAtomState(productsAtom);
  const filters = useAtomValue(productFiltersAtom);

  useEffect(() => {
    // Atom method handles service call, validation, and state updates
    productsActions.loadProducts(filters);
  }, [filters]);

  const { items: products, loading, error } = productsState;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Why This Approach Is Better

| Aspect | Direct HTTP (❌) | Service Methods (✅) | Atoms + Services (✅✅) |
|--------|------------------|---------------------|------------------------|
| **Type Safety** | Manual typing | Automatic validation | Full type inference |
| **Error Handling** | Manual try/catch | Centralized handling | Consistent UX patterns |
| **Reusability** | Copy/paste code | Reusable methods | Shared state |
| **Testing** | Mock axios | Mock services | Mock atoms |
| **Consistency** | Varies per component | Standardized | Standardized |
| **State Management** | Local state only | Local state only | Global state |
| **Validation** | Manual | Automatic | Automatic |

### Importing Universal Types

```typescript
// src/pages/Products/ProductList.tsx
import React from 'react';
import { useAtomValue } from '@zedux/react';

// Import universal business types
import { Product, ProductFilter } from '@/types/product.types';
import { User } from '@/types/user.types';

// Import atoms
import { productsAtom, productFiltersAtom } from '@/atoms/products/productsAtoms';
import { currentUserAtom } from '@/atoms/auth/authAtoms';

// Components only use universal business types, never service-specific types
export const ProductList = () => {
  const products = useAtomValue(productsAtom);
  const filters = useAtomValue(productFiltersAtom);
  const currentUser = useAtomValue(currentUserAtom);

  return (
    <div>
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Service Usage in Atoms

```typescript
// src/atoms/products/productsAtoms.ts
import { atom, injectStore } from '@zedux/react';
import { productService } from '@/services/products/productService';

// Import universal business types
import { Product } from '@/types/products/product.types';

export const productsAtom = atom('products', () => {
  const store = injectStore({
    items: [] as Product[],
    loading: false,
    error: null as string | null,
  });

  const loadProducts = async (filters?: any) => {
    store.setState(state => ({ ...state, loading: true, error: null }));
    
    try {
      // Service handles its own request/response validation
      const response = await productService.getProducts(filters);
      store.setState({ 
        items: response.items, // response.items are already validated Products
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

## Best Practices

### 1. **What Goes in Centralized Schemas/Types**
- Core business entities (Product, User, Order)
- Universal business logic types
- Shared validation rules
- Types used across multiple components/atoms

### 2. **What Goes in Service Files**
- API request/response schemas
- Service-specific validation rules
- Types only used within that service
- Endpoint-specific business logic

### 3. **Schema Definition Guidelines**
```typescript
// ✅ Good: Reusable base schema with specific extensions
const baseProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

// In service: extend for API-specific needs
const createProductRequestSchema = baseProductSchema.extend({
  categoryId: z.string(),
  supplierId: z.string(),
});

// ❌ Bad: Duplicate schema definitions
const productSchema = z.object({ name: z.string(), price: z.number() });
const createProductSchema = z.object({ name: z.string(), price: z.number() });
```

### 4. **Type Export Strategy**
```typescript
// ✅ Good: Export only universal business types
// src/types/products/index.ts
export type { Product, Category, ProductFilter } from './product.types';

// ❌ Bad: Don't export service-specific types
// These stay internal to service files
type GetProductsRequest = z.infer<typeof getProductsRequestSchema>;
```

### 5. **Validation Strategy**
- **Input Validation**: Always validate service inputs with schemas
- **Output Validation**: Always validate API responses with schemas  
- **Business Validation**: Add business rules to universal schemas
- **API Validation**: Add API-specific rules to service schemas

## Benefits

1. **High Cohesion**: API contracts stay with services that use them
2. **Encapsulation**: Service implementation details don't leak out
3. **Easier Maintenance**: API changes only affect the specific service
4. **Clear Separation**: Business entities vs. API contracts are distinct
5. **Reduced Coupling**: Components don't depend on service-specific types
6. **Service Autonomy**: Each service evolves its API contracts independently
7. **Type Safety**: Universal business types provide compile-time safety
8. **Runtime Safety**: Schemas provide runtime validation
9. **Single Source of Truth**: Business entities defined once, used everywhere

This approach ensures that your type system scales well while maintaining clear boundaries between universal business concepts and service-specific implementation details.