# React TypeScript Project Architecture Guide

## Project Overview
A comprehensive guide for structuring large-scale React applications using:
- **React** with **TypeScript**
- **Zedux** for atom-based state management
- **Zod** for schema validation
- **Axios** for API communication

## Table of Contents
1. [Folder Structure](#folder-structure)
2. [Core Technologies](#core-technologies)
3. [State Management with Zedux](#state-management-with-zedux)
4. [API Services Layer](#api-services-layer)
5. [Type System Organization](#type-system-organization)
6. [Best Practices](#best-practices)

---

## Folder Structure

### Complete Project Structure
```
src/
├── app/                      # Application-wide setup
│   ├── App.tsx              # Root component with ecosystem provider
│   ├── App.test.tsx
│   └── providers/           # Ecosystem and other providers
│       └── EcosystemProvider.tsx
│
├── pages/                   # Page/Route components
│   ├── Home/
│   │   ├── index.tsx
│   │   ├── Home.styles.ts
│   │   └── Home.test.tsx
│   ├── Dashboard/
│   │   ├── index.tsx
│   │   ├── components/
│   │   └── atoms/
│   └── Products/
│       ├── index.tsx
│       ├── ProductList.tsx
│       ├── ProductDetail.tsx
│       └── atoms/
│
├── features/                # Feature-based modules (UI & state only)
│   ├── auth/
│   │   ├── components/     # Feature-specific components
│   │   ├── atoms/          # Feature atoms
│   │   ├── ions/           # Feature ions (derived state)
│   │   └── selectors/      # Feature selectors
│   ├── user/
│   │   ├── components/
│   │   ├── atoms/
│   │   ├── ions/
│   │   └── selectors/
│   └── products/
│       ├── components/
│       ├── atoms/
│       ├── ions/
│       └── selectors/
│
├── atoms/                   # Global atoms
│   ├── index.ts
│   ├── uiAtoms.ts
│   └── notificationAtoms.ts
│
├── ions/                    # Global ions (computed/derived atoms)
│   ├── index.ts
│   └── appIons.ts
│
├── ecosystem/              # Zedux ecosystem configuration
│   ├── ecosystem.ts        # Main ecosystem instance
│   ├── plugins/            # Zedux plugins
│   └── injectors/          # Global injectors
│
├── components/             # Shared/reusable components
│   ├── common/
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Modal/
│   └── layout/
│       ├── Header/
│       ├── Footer/
│       └── Layout.tsx
│
├── hooks/                  # Custom hooks
│   ├── useAtomValue.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
│
├── services/              # Centralized API services
│   ├── api/
│   │   ├── client.ts      # Axios configuration
│   │   ├── endpoints.ts   # API endpoints
│   │   ├── interceptors.ts # Request/response interceptors
│   │   └── errorHandler.ts # Error handling
│   ├── auth/
│   │   └── authService.ts
│   ├── products/
│   │   └── productService.ts
│   ├── users/
│   │   └── userService.ts
│   ├── orders/
│   │   └── orderService.ts
│   └── storage/
│       └── localStorage.ts
│
├── schemas/               # Centralized Zod schemas
│   ├── index.ts          # Barrel export
│   ├── common.schemas.ts # Shared schemas
│   ├── auth.schemas.ts
│   ├── product.schemas.ts
│   ├── user.schemas.ts
│   └── order.schemas.ts
│
├── types/                 # Centralized TypeScript types
│   ├── index.ts          # Barrel export
│   ├── global.d.ts
│   ├── common.types.ts   # Shared types
│   ├── api.types.ts      # Generic API types
│   ├── auth/
│   │   ├── auth.types.ts
│   │   ├── auth.api.ts
│   │   └── auth.dto.ts
│   ├── products/
│   │   ├── product.types.ts
│   │   ├── product.api.ts
│   │   └── product.dto.ts
│   ├── users/
│   │   ├── user.types.ts
│   │   ├── user.api.ts
│   │   └── user.dto.ts
│   └── orders/
│       ├── order.types.ts
│       ├── order.api.ts
│       └── order.dto.ts
│
├── utils/                 # Utility functions
│   ├── constants.ts
│   └── helpers.ts
│
├── routes/               # Routing configuration
│   ├── index.tsx
│   └── routeConfig.ts
│
└── assets/               # Static assets
    ├── images/
    ├── fonts/
    └── icons/
```

### Key Design Principles

1. **Centralized Business Logic**: Services, types, and schemas are centralized for consistency and reusability
2. **Feature-Based UI Organization**: Features contain only UI components and state management
3. **Clear Separation of Concerns**: Separate presentation (features), business logic (services), and data contracts (types/schemas)
4. **Type Safety**: Full TypeScript coverage with runtime validation
5. **Single Source of Truth**: One place for each type definition, schema, and service

---

## Core Technologies

### Zedux
- **Atoms**: Core state units
- **Ions**: Derived/computed state
- **Injectors**: Dependency injection
- **Ecosystem**: Global state container

### Zod
- Runtime type validation
- Schema definition
- Type inference
- Request/response validation

### TypeScript
- Static type checking
- Interface definitions
- Type inference
- Generic types

---

## State Management with Zedux

### Ecosystem Setup
```typescript
// src/ecosystem/ecosystem.ts
import { createEcosystem } from '@zedux/react';
import { apiInjector } from './injectors/apiInjector';

export const ecosystem = createEcosystem({
  id: 'app-ecosystem',
  overrides: [],
  injectors: [apiInjector],
});
```

### Atom Pattern
```typescript
// src/features/auth/atoms/authAtoms.ts
import { atom, injectStore, injectEffect } from '@zedux/react';
import { z } from 'zod';
import { userSchema } from '../schemas/authSchemas';

export const currentUserAtom = atom('currentUser', () => {
  const store = injectStore<z.infer<typeof userSchema> | null>(null);
  
  injectEffect(() => {
    // Side effects here
  }, []);

  return store;
});
```

### Ion Pattern (Derived State)
```typescript
// src/features/products/ions/productIons.ts
import { ion, injectAtomValue } from '@zedux/react';
import { productsAtom, filtersAtom } from '../atoms/productsAtom';

export const filteredProductsIon = ion('filteredProducts', () => {
  const products = injectAtomValue(productsAtom);
  const filters = injectAtomValue(filtersAtom);

  return products.filter(/* filtering logic */);
});
```

### Provider Setup
```typescript
// src/app/providers/EcosystemProvider.tsx
import { EcosystemProvider } from '@zedux/react';
import { ecosystem } from '@/ecosystem/ecosystem';

export const AppEcosystemProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <EcosystemProvider ecosystem={ecosystem}>
      {children}
    </EcosystemProvider>
  );
};
```

---

## API Services Layer

### Service Structure
```
services/
├── api/
│   ├── client.ts           # Axios instance
│   ├── endpoints.ts        # Endpoint constants
│   ├── interceptors.ts     # Request/response interceptors
│   ├── errorHandler.ts     # Error handling
│   └── types.ts            # API types
├── auth/
│   └── authService.ts
└── products/
    └── productService.ts
```

### API Client Configuration
```typescript
// src/services/api/client.ts
import axios, { AxiosInstance } from 'axios';
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

  // Other methods: post, put, delete, patch
}

export const apiClient = new ApiClient();
```

### Service Implementation Pattern
```typescript
// src/services/products/productService.ts
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
// Import from centralized locations
import { GetProductsRequest, GetProductsResponse } from '@/types/products/product.api';
import { getProductsRequestSchema, getProductsResponseSchema } from '@/schemas/product.schemas';

class ProductService {
  async getProducts(request?: GetProductsRequest): Promise<GetProductsResponse> {
    // Validate request
    const validatedRequest = request 
      ? getProductsRequestSchema.parse(request) 
      : undefined;

    // Make API call
    const response = await apiClient.get<GetProductsResponse>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: validatedRequest }
    );

    // Validate response
    return getProductsResponseSchema.parse(response);
  }
}

export const productService = new ProductService();
```

### Interceptors with Zedux Integration
```typescript
// src/services/api/interceptors.ts
client.interceptors.request.use(
  (config) => {
    // Add auth token from Zedux atom
    const authState = ecosystem.getInstance(authStateAtom).getState();
    
    if (authState.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${authState.accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## Type System Organization

### Centralized Type Structure

All types, schemas, and services are centralized for better maintainability and to avoid duplication across features.

```
src/
├── types/                 # All TypeScript types
│   ├── index.ts          # Main barrel export
│   ├── api.types.ts      # Generic API types
│   ├── common.types.ts   # Shared types
│   ├── auth/
│   │   ├── index.ts
│   │   ├── auth.types.ts    # Domain types
│   │   ├── auth.api.ts      # API request/response
│   │   └── auth.dto.ts      # Data transfer objects
│   ├── products/
│   │   ├── index.ts
│   │   ├── product.types.ts
│   │   ├── product.api.ts
│   │   └── product.dto.ts
│   └── users/
│       ├── index.ts
│       ├── user.types.ts
│       ├── user.api.ts
│       └── user.dto.ts
│
├── schemas/              # All Zod schemas
│   ├── index.ts
│   ├── common.schemas.ts
│   ├── auth.schemas.ts
│   ├── product.schemas.ts
│   └── user.schemas.ts
│
└── services/             # All API services
    ├── auth/
    │   └── authService.ts
    ├── products/
    │   └── productService.ts
    └── users/
        └── userService.ts
```

### Benefits of Centralization

1. **No Duplication**: Types and schemas defined once, used everywhere
2. **Easier Refactoring**: Changes in one place affect all consumers
3. **Better Discovery**: Developers know exactly where to find types
4. **Consistent API Contracts**: All services follow the same patterns
5. **Simplified Testing**: Mock services and types in one location

### Generic API Types
```typescript
// src/types/api.types.ts
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}
```

### Feature Implementation Example

Features now focus solely on UI components and state management, importing types and services from centralized locations:

```typescript
// src/features/products/atoms/productsAtom.ts
import { atom, injectStore, injectEffect } from '@zedux/react';
// Import from centralized locations
import { productService } from '@/services/products/productService';
import { Product } from '@/types/products/product.types';
import { productSchema } from '@/schemas/product.schemas';

export const productsAtom = atom('products', () => {
  const store = injectStore<{
    items: Product[];
    isLoading: boolean;
    error: string | null;
  }>({
    items: [],
    isLoading: false,
    error: null,
  });

  const fetchProducts = async () => {
    store.setState(state => ({ ...state, isLoading: true }));
    try {
      const response = await productService.getProducts();
      store.setState({
        items: response.items,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      store.setState(state => ({
        ...state,
        isLoading: false,
        error: 'Failed to fetch products',
      }));
    }
  };

  injectEffect(() => {
    fetchProducts();
  }, []);

  return { store, fetchProducts };
});
```

```typescript
// src/features/products/components/ProductList.tsx
import { useAtomValue } from '@zedux/react';
// Import types from centralized location
import { Product } from '@/types/products/product.types';
import { productsAtom } from '../atoms/productsAtom';

export const ProductList = () => {
  const { store } = useAtomValue(productsAtom);
  const { items, isLoading, error } = store.getState();

  // Component implementation
};
```

### Zod Schema with Type Inference
```typescript
// src/features/products/schemas/product.schemas.ts
import { z } from 'zod';

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  // ... other fields
});

// Type inference from schema
export type Product = z.infer<typeof productSchema>;
```

---

## Best Practices

### 1. File Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Types: `camelCase.types.ts`
- Services: `camelCaseService.ts`
- Atoms: `camelCaseAtom.ts`

### 2. Import Organization
```typescript
// 1. External imports
import React from 'react';
import { z } from 'zod';
import { useAtomValue } from '@zedux/react';

// 2. Centralized imports (services, types, schemas)
import { productService } from '@/services/products/productService';
import { Product } from '@/types/products/product.types';
import { productSchema } from '@/schemas/product.schemas';

// 3. Feature imports (atoms, components)
import { productsAtom } from '@/features/products/atoms/productsAtom';

// 4. Component imports
import { Button } from '@/components/common/Button';

// 5. Utils and helpers
import { formatCurrency } from '@/utils/formatters';
```

### 3. Absolute Imports Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@features/*": ["features/*"],
      "@services/*": ["services/*"],
      "@types/*": ["types/*"],
      "@schemas/*": ["schemas/*"],
      "@atoms/*": ["atoms/*"],
      "@utils/*": ["utils/*"]
    }
  }
}
```

### 4. Barrel Exports
```typescript
// src/features/products/types/index.ts
export * from './product.types';
export * from './product.api';
export * from './product.dto';
```

### 5. Error Handling Pattern
```typescript
try {
  // Validate request
  const validatedData = schema.parse(data);
  
  // Make API call
  const response = await service.method(validatedData);
  
  // Handle success
  return response;
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
  } else if (error instanceof AxiosError) {
    // Handle API errors
  } else {
    // Handle unexpected errors
  }
}
```

### 6. Testing Strategy
- Unit tests: Next to component files (`*.test.tsx`)
- Integration tests: In `__tests__` folders
- E2E tests: In root `e2e/` folder

### 7. Performance Optimization
- Use React.memo for expensive components
- Implement lazy loading for routes
- Use Zedux selectors for derived state
- Implement proper error boundaries

### 8. Security Considerations
- Never store sensitive data in atoms
- Validate all API responses
- Implement proper CORS handling
- Use environment variables for API URLs

---

## Future Enhancements

### Potential Improvements
1. **Micro-frontend Architecture**: Extract features into independent packages
2. **GraphQL Integration**: Add GraphQL support alongside REST
3. **Real-time Updates**: Integrate WebSocket support
4. **Offline Support**: Implement service workers and caching
5. **Internationalization**: Add i18n support
6. **Advanced Testing**: Add visual regression testing
7. **Documentation**: Generate API documentation from types
8. **Performance Monitoring**: Add analytics and monitoring

### Migration Considerations
- Keep feature modules self-contained for easy extraction
- Use dependency injection for easier testing
- Maintain clear boundaries between layers
- Document architectural decisions

---

## Conclusion

This architecture provides:
- **Centralized Business Logic**: Services, types, and schemas in one place prevents duplication
- **Clear Separation**: UI/state in features, business logic in services, data contracts in types/schemas
- **Scalability**: Easy to grow by adding new services, types, and features independently
- **Maintainability**: Single source of truth for each concept
- **Type Safety**: Full TypeScript and runtime validation with Zod
- **Developer Experience**: Clear, predictable structure where everything has its place
- **Testability**: Centralized services and types are easier to mock and test

The combination of Zedux for state management, centralized services/types/schemas, and feature-based UI organization creates a robust, maintainable foundation for large-scale React applications.