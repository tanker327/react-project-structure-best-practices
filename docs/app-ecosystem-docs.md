# App and Ecosystem Architecture Guide

## Overview

This guide provides a comprehensive overview of the **App** and **Ecosystem** components in a React TypeScript application using Zedux for state management. The ecosystem serves as the "nervous system" of your application, coordinating all state management, dependency injection, and cross-cutting concerns.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [App Structure](#app-structure)
3. [Ecosystem Configuration](#ecosystem-configuration)
4. [Plugins System](#plugins-system)
5. [Global Injectors](#global-injectors)
6. [Usage Patterns](#usage-patterns)
7. [Best Practices](#best-practices)

---

## Architecture Overview

### Directory Structure
```
src/
├── app/                      # Application-wide setup
│   ├── App.tsx              # Root component with ecosystem provider
│   ├── App.test.tsx
│   └── providers/           # Ecosystem and other providers
│       └── EcosystemProvider.tsx
│
├── ecosystem/              # Zedux ecosystem configuration
│   ├── ecosystem.ts        # Main ecosystem instance
│   ├── plugins/            # Zedux plugins
│   │   ├── persistencePlugin.ts
│   │   ├── loggingPlugin.ts
│   │   └── index.ts
│   └── injectors/          # Global injectors
│       ├── servicesInjector.ts
│       ├── configInjector.ts
│       ├── utilsInjector.ts
│       └── index.ts
```

### Core Responsibilities

| Component | Purpose |
|-----------|---------|
| **App** | Root component that ties everything together |
| **EcosystemProvider** | Wraps the application with Zedux state management |
| **Ecosystem** | Global container managing all atoms and dependencies |
| **Plugins** | Extend ecosystem functionality (persistence, logging, etc.) |
| **Injectors** | Provide global services and dependencies |

---

## App Structure

### Root App Component (`src/app/App.tsx`)

The App component is the **entry point** that provides global context:

```typescript
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppEcosystemProvider } from './providers/EcosystemProvider';
import { AppRoutes } from '@/routes';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { GlobalStyles } from '@/styles/GlobalStyles';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GlobalStyles />
      <AppEcosystemProvider>
        <BrowserRouter>
          <Layout>
            <AppRoutes />
          </Layout>
        </BrowserRouter>
      </AppEcosystemProvider>
    </ErrorBoundary>
  );
};
```

**Key Features:**
- Global error boundary
- Zedux ecosystem provider
- Routing setup
- Global layout structure
- Global styles

### Ecosystem Provider (`src/app/providers/EcosystemProvider.tsx`)

Provides the Zedux ecosystem to the entire application:

```typescript
import React from 'react';
import { EcosystemProvider } from '@zedux/react';
import { ecosystem } from '@/ecosystem/ecosystem';

export const AppEcosystemProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <EcosystemProvider ecosystem={ecosystem}>
      {children}
    </EcosystemProvider>
  );
};
```

**Benefits:**
- Centralized state management
- Dependency injection
- Plugin system integration
- Development tools support

---

## Ecosystem Configuration

### Main Ecosystem Instance (`src/ecosystem/ecosystem.ts`)

The ecosystem is the **central nervous system** of your Zedux state management:

```typescript
import { createEcosystem } from '@zedux/react';
import { devtoolsPlugin } from '@zedux/dev-tools';
import { persistencePlugin, loggingPlugin } from './plugins';
import { servicesInjector, configInjector, utilsInjector } from './injectors';

export const ecosystem = createEcosystem({
  id: 'main-app-ecosystem',
  
  // Global injectors available to all atoms
  injectors: [
    servicesInjector,
    configInjector,
    utilsInjector,
  ],
  
  // Plugins extend ecosystem functionality
  plugins: [
    persistencePlugin(),
    ...(process.env.NODE_ENV === 'development' 
      ? [loggingPlugin(), devtoolsPlugin()] 
      : []
    ),
  ],
  
  // Global error handling
  onError: (error, errorInfo) => {
    console.error('Ecosystem Error:', error);
    // Send to error reporting service in production
  },
  
  // Atom destruction policy
  destroyPolicy: {
    ttl: 30000, // Keep atoms alive for 30 seconds after last subscription
    filter: (atomInstance) => !atomInstance.getState()?.isPersistent
  }
});
```

### Core Ecosystem Features

1. **State Management**: Manages all atoms and their lifecycles
2. **Dependency Injection**: Provides global services and utilities
3. **Plugin System**: Extensible functionality through plugins
4. **Error Handling**: Centralized error management
5. **Development Tools**: Debugging and inspection capabilities
6. **Performance**: Atom lifecycle management and batched updates

---

## Plugins System

### Persistence Plugin (`src/ecosystem/plugins/persistencePlugin.ts`)

Automatically persists atom state to localStorage:

```typescript
import { Plugin, AtomApi } from '@zedux/react';

export const persistencePlugin = (): Plugin => ({
  name: 'persistence',
  
  onAtomCreate: (atomApi: AtomApi<any>) => {
    const shouldPersist = atomApi.getState()?.persist === true;
    
    if (shouldPersist) {
      const persistedState = localStorage.getItem(`atom_${atomApi.getKey()}`);
      if (persistedState) {
        atomApi.setState(JSON.parse(persistedState));
      }
    }
  },
  
  onStateChange: (atomApi: AtomApi<any>, newState: any) => {
    if (newState?.persist === true) {
      localStorage.setItem(
        `atom_${atomApi.getKey()}`, 
        JSON.stringify(newState)
      );
    }
  }
});
```

### Logging Plugin (`src/ecosystem/plugins/loggingPlugin.ts`)

Development logging for state changes:

```typescript
export const loggingPlugin = (): Plugin => ({
  name: 'logging',
  
  onStateChange: (atomApi, newState, oldState) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔄 Atom State Change: ${atomApi.getKey()}`);
      console.log('Previous State:', oldState);
      console.log('New State:', newState);
      console.groupEnd();
    }
  },
  
  onAtomCreate: (atomApi) => {
    console.log(`✨ Atom Created: ${atomApi.getKey()}`);
  }
});
```

### Plugin Benefits

- **Cross-cutting Concerns**: Handle logging, persistence, analytics centrally
- **Reusable Logic**: Apply same functionality across all atoms
- **Clean Separation**: Keep business logic separate from infrastructure
- **Development Tools**: Enhanced debugging and monitoring

---

## Global Injectors

### Services Injector (`src/ecosystem/injectors/servicesInjector.ts`)

Provides access to all services throughout the ecosystem:

```typescript
import { createInjector } from '@zedux/react';
import { productService } from '@/services/products/productService';
import { authService } from '@/services/auth/authService';
import { userService } from '@/services/users/userService';

export const servicesInjector = createInjector({
  productService,
  authService,
  userService,
});

// Usage in atoms:
// const { productService } = injectInjector(servicesInjector);
```

### Configuration Injector (`src/ecosystem/injectors/configInjector.ts`)

Provides app configuration and environment variables:

```typescript
export const configInjector = createInjector({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  environment: import.meta.env.NODE_ENV,
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableExperimentalFeatures: import.meta.env.VITE_ENABLE_EXPERIMENTAL === 'true',
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
});
```

### Utilities Injector (`src/ecosystem/injectors/utilsInjector.ts`)

Provides common utility functions:

```typescript
import { formatCurrency, formatDate } from '@/utils/formatters';
import { debounce, throttle } from '@/utils/performance';

export const utilsInjector = createInjector({
  formatters: {
    currency: formatCurrency,
    date: formatDate,
  },
  performance: {
    debounce,
    throttle,
  },
  constants: {
    STORAGE_KEYS: {
      USER_PREFERENCES: 'user_preferences',
      CART: 'shopping_cart',
      THEME: 'app_theme',
    },
  },
});
```

---

## Usage Patterns

### Atom with Injected Dependencies

```typescript
// src/atoms/products/productsAtoms.ts
import { atom, injectStore, injectInjector, injectEffect } from '@zedux/react';
import { servicesInjector, configInjector } from '@/ecosystem/injectors';

export const productsAtom = atom('products', () => {
  // Inject global dependencies
  const { productService } = injectInjector(servicesInjector);
  const { pagination } = injectInjector(configInjector);
  
  // Create local store
  const store = injectStore({
    items: [] as Product[],
    loading: false,
    error: null as string | null,
    persist: true, // Picked up by persistence plugin
  });

  const loadProducts = async () => {
    store.setState(state => ({ ...state, loading: true }));
    
    try {
      const response = await productService.getProducts();
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

  return { store, actions: { loadProducts } };
});
```

### Component Using Ecosystem

```typescript
// src/pages/Products/ProductList.tsx
import React from 'react';
import { useAtomState } from '@zedux/react';
import { productsAtom } from '@/atoms/products/productsAtoms';

export const ProductList: React.FC = () => {
  const [productsState, productsActions] = useAtomState(productsAtom);
  const { items: products, loading, error } = productsState;

  React.useEffect(() => {
    productsActions.loadProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

---

## Best Practices

### 1. **Ecosystem Organization**

```typescript
// ✅ Good: Organize by functionality
ecosystem/
├── ecosystem.ts          # Main configuration
├── plugins/
│   ├── persistencePlugin.ts
│   ├── loggingPlugin.ts
│   └── index.ts
└── injectors/
    ├── servicesInjector.ts
    ├── configInjector.ts
    └── index.ts

// ❌ Bad: Everything in one file
ecosystem.ts              # 500+ lines of mixed concerns
```

### 2. **Plugin Development**

```typescript
// ✅ Good: Focused, single-responsibility plugins
export const persistencePlugin = (): Plugin => ({
  name: 'persistence',
  // Only handles persistence logic
});

// ❌ Bad: Plugins with multiple responsibilities
export const everythingPlugin = (): Plugin => ({
  name: 'everything',
  // Handles persistence, logging, analytics, etc.
});
```

### 3. **Injector Design**

```typescript
// ✅ Good: Logical grouping
const servicesInjector = createInjector({
  productService,
  authService,
  userService,
});

// ❌ Bad: Mixed concerns
const mixedInjector = createInjector({
  productService,
  formatCurrency,
  API_BASE_URL,
  userService,
});
```

### 4. **Error Handling**

```typescript
// ✅ Good: Comprehensive error handling
export const ecosystem = createEcosystem({
  onError: (error, errorInfo) => {
    console.error('Ecosystem Error:', error);
    
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service
      errorReportingService.captureException(error, errorInfo);
    }
  }
});

// ❌ Bad: No error handling
export const ecosystem = createEcosystem({
  // No error handling
});
```

### 5. **Development vs Production**

```typescript
// ✅ Good: Environment-specific configuration
plugins: [
  persistencePlugin(),
  ...(process.env.NODE_ENV === 'development' 
    ? [loggingPlugin(), devtoolsPlugin()] 
    : []
  ),
]

// ❌ Bad: Development tools in production
plugins: [
  persistencePlugin(),
  loggingPlugin(),      // Performance impact in production
  devtoolsPlugin(),     // Security concern in production
]
```

### 6. **Atom Lifecycle Management**

```typescript
// ✅ Good: Proper lifecycle management
destroyPolicy: {
  ttl: 30000, // Keep atoms alive for 30 seconds
  filter: (atomInstance) => {
    // Don't destroy persistent atoms
    return !atomInstance.getState()?.isPersistent;
  }
}

// ❌ Bad: No lifecycle management
// Atoms accumulate in memory indefinitely
```

---

## Benefits Summary

### 1. **Centralized State Management**
- All application state managed through ecosystem
- Atoms communicate through the ecosystem
- Global state persistence and hydration

### 2. **Dependency Injection**
- Services, configuration, utilities injected globally
- No need to import services in every atom
- Easy to mock dependencies for testing

### 3. **Plugin Architecture**
- Extensible functionality through plugins
- Cross-cutting concerns handled centrally
- Clean separation of ecosystem features

### 4. **Development Experience**
- DevTools integration for state debugging
- Hot reload support for state management
- Global debugging helpers in development

### 5. **Performance Optimization**
- Atom lifecycle management (TTL, destruction policies)
- Batched updates prevent unnecessary re-renders
- Selective atom subscriptions

### 6. **Type Safety**
- Full TypeScript integration
- Type-safe injectors and atom state
- Compile-time checking for ecosystem interactions

---

## Conclusion

The App + Ecosystem architecture provides a robust foundation for large-scale React applications with:

- **Predictable state management** through Zedux atoms
- **Clean separation of concerns** between UI and business logic  
- **Extensible architecture** through plugins and injectors
- **Developer-friendly tooling** for debugging and development
- **Production-ready features** like persistence, error handling, and performance optimization

The ecosystem acts as the "nervous system" of your application, coordinating all state management, dependency injection, and cross-cutting concerns while keeping your components clean and focused on presentation logic.