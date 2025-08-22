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
├── pages/                   # Page/Route components (UI only)
│   ├── Home/
│   │   ├── index.tsx
│   │   ├── Home.styles.ts
│   │   └── Home.test.tsx
│   ├── Dashboard/
│   │   ├── index.tsx
│   │   └── components/      # Page-specific components
│   │       ├── DashboardHeader.tsx
│   │       └── DashboardStats.tsx
│   └── Products/
│       ├── index.tsx
│       ├── ProductList.tsx
│       └── ProductDetail.tsx
│
├── features/                # Feature-based UI modules
│   ├── auth/
│   │   └── components/     # Feature-specific components
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── ForgotPassword.tsx
│   ├── user/
│   │   └── components/
│   │       ├── UserProfile.tsx
│   │       ├── UserSettings.tsx
│   │       └── UserAvatar.tsx
│   └── products/
│       └── components/
│           ├── ProductCard.tsx
│           ├── ProductGrid.tsx
│           └── ProductFilters.tsx
│
├── atoms/                   # All state management (atoms, ions, selectors)
│   ├── index.ts            # Barrel export
│   ├── auth/
│   │   ├── authAtoms.ts    # Auth-related atoms
│   │   ├── authIons.ts     # Auth-derived state
│   │   └── authSelectors.ts # Auth selectors
│   ├── products/
│   │   ├── productsAtoms.ts
│   │   ├── productsIons.ts
│   │   ├── cartAtoms.ts
│   │   └── productsSelectors.ts
│   ├── user/
│   │   ├── userAtoms.ts
│   │   ├── userPreferencesAtoms.ts
│   │   └── userSelectors.ts
│   └── ui/
│       ├── uiAtoms.ts      # UI state (modals, sidebars, etc.)
│       ├── notificationAtoms.ts
│       └── themeAtoms.ts
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
│   ├── endpoints.ts       # API endpoint constants
│   ├── api/
│   │   ├── client.ts      # Axios configuration
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

1. **Centralized Business Logic**: Services, types, schemas, and state management are all centralized
2. **Pure UI Components**: Pages and features contain only presentation components
3. **Unified State Management**: All atoms, ions, and selectors in one organized location
4. **Clear Separation of Concerns**: Presentation (pages/features), state (atoms), business logic (services), and data contracts (types/schemas)
5. **Single Source of Truth**: One place for each concept - no duplication
6. **Predictable Structure**: Developers always know where to find and place code

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

### Centralized Atoms Structure

All state management is consolidated in the `atoms` folder, organized by domain:

```
atoms/
├── auth/
│   ├── authAtoms.ts        # Core auth atoms
│   ├── authIons.ts         # Derived auth state
│   └── authSelectors.ts    # Auth selectors
├── products/
│   ├── productsAtoms.ts    # Product list atoms
│   ├── productsIons.ts     # Filtered/sorted products
│   ├── cartAtoms.ts        # Shopping cart state
│   └── productsSelectors.ts # Product selectors
└── ui/
    ├── uiAtoms.ts          # UI state atoms
    └── notificationAtoms.ts # Notification state
```

### Atom Examples

#### Basic Atom
```typescript
// src/atoms/auth/authAtoms.ts
import { atom, injectStore, injectEffect } from '@zedux/react';
import { authService } from '@/services/auth/authService';
import { User } from '@/types/auth/auth.types';

export const currentUserAtom = atom('currentUser', () => {
  const store = injectStore<User | null>(null);
  
  injectEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      store.setState(parsed);
    }
  }, []);

  return store;
});

export const authStateAtom = atom('authState', () => {
  const store = injectStore({
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
  });

  const login = async (email: string, password: string) => {
    store.setState(state => ({ ...state, isLoading: true, error: null }));
    try {
      const response = await authService.login({ email, password });
      store.setState({ isAuthenticated: true, isLoading: false, error: null });
      ecosystem.getInstance(currentUserAtom).setState(response.user);
    } catch (error) {
      store.setState({ 
        isAuthenticated: false, 
        isLoading: false, 
        error: error.message 
      });
    }
  };

  return { store, login };
});
```

#### Ion (Derived State) in Same Folder
```typescript
// src/atoms/products/productsIons.ts
import { ion, injectAtomValue } from '@zedux/react';
import { productsAtom, filtersAtom, sortingAtom } from './productsAtoms';

export const filteredProductsIon = ion('filteredProducts', () => {
  const products = injectAtomValue(productsAtom);
  const filters = injectAtomValue(filtersAtom);

  return products.filter(product => {
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    return true;
  });
});

export const sortedAndFilteredProductsIon = ion('sortedAndFilteredProducts', () => {
  const filteredProducts = injectAtomValue(filteredProductsIon);
  const sorting = injectAtomValue(sortingAtom);

  return [...filteredProducts].sort((a, b) => {
    switch (sorting.field) {
      case 'price':
        return sorting.order === 'asc' ? a.price - b.price : b.price - a.price;
      case 'name':
        return sorting.order === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
});
```

#### Selectors in Same Folder
```typescript
// src/atoms/products/productsSelectors.ts
import { selector } from '@zedux/react';
import { productsAtom, cartAtom } from './productsAtoms';

export const getProductByIdSelector = selector((id: string) => {
  const products = ecosystem.getInstance(productsAtom).getState();
  return products.items.find(product => product.id === id);
});

export const cartTotalSelector = selector(() => {
  const cart = ecosystem.getInstance(cartAtom).getState();
  return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

export const cartItemCountSelector = selector(() => {
  const cart = ecosystem.getInstance(cartAtom).getState();
  return cart.items.reduce((count, item) => count + item.quantity, 0);
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
├── endpoints.ts            # Endpoint constants (centralized)
├── api/
│   ├── client.ts           # Axios instance
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
import { API_ENDPOINTS } from '../endpoints';
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

### Component Usage Example

Pages and features now import all state from the centralized atoms folder:

```typescript
// src/pages/Products/index.tsx
import React from 'react';
import { useAtomValue } from '@zedux/react';
// Import from centralized atoms folder
import { sortedAndFilteredProductsIon } from '@/atoms/products/productsIons';
import { filtersAtom } from '@/atoms/products/productsAtoms';
// Import feature components
import { ProductGrid, ProductFilters } from '@/features/products/components';

export const ProductsPage = () => {
  const products = useAtomValue(sortedAndFilteredProductsIon);
  const [filters, setFilters] = useAtomState(filtersAtom);

  return (
    <div>
      <ProductFilters 
        filters={filters} 
        onFilterChange={setFilters} 
      />
      <ProductGrid products={products} />
    </div>
  );
};
```

```typescript
// src/features/products/components/ProductCard.tsx
import React from 'react';
import { useAtomState } from '@zedux/react';
// Import atoms from centralized location
import { cartAtom } from '@/atoms/products/cartAtoms';
// Import types from centralized location
import { Product } from '@/types/products/product.types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [cart, cartActions] = useAtomState(cartAtom);

  const handleAddToCart = () => {
    cartActions.addItem(product);
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
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
- **Complete Centralization**: All business logic (services, types, schemas, atoms) in dedicated folders
- **Pure UI Components**: Pages and features contain only presentation logic
- **Clear Mental Model**: State in atoms/, logic in services/, contracts in types/schemas/
- **No Duplication**: Each concept defined once, used everywhere
- **Scalability**: Easy to add new atoms, services, or components independently
- **Maintainability**: Single source of truth for every aspect of the application
- **Developer Experience**: Predictable structure - always know where code belongs
- **Testability**: Centralized pieces are easier to mock and test in isolation

The combination of:
- **Zedux** atoms/ions/selectors in a unified `atoms` folder
- **Centralized** services, types, and schemas
- **Pure UI** components in pages and features

Creates a clean, scalable, and maintainable architecture that grows well with your application and team.