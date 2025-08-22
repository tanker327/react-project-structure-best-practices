# UI Architecture Guide: Pages vs Features vs Components

## Overview

This guide defines the three-layer UI architecture for React applications, providing clear boundaries between **pages**, **features**, and **components**. This architecture ensures predictable code organization, better reusability, and maintainable separation of concerns.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Pages Layer](#pages-layer)
3. [Features Layer](#features-layer)
4. [Components Layer](#components-layer)
5. [Decision Matrix](#decision-matrix)
6. [Real-World Examples](#real-world-examples)
7. [Best Practices](#best-practices)
8. [Migration Guide](#migration-guide)

---

## Architecture Overview

### Three-Layer Structure

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PAGES     │───▶│  FEATURES   │───▶│ COMPONENTS  │
│             │    │             │    │             │
│ • Routes    │    │ • Domain    │    │ • Generic   │
│ • Layout    │    │ • Business  │    │ • Reusable  │
│ • Compose   │    │ • State     │    │ • Pure UI   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              CENTRALIZED STATE                      │
│        (atoms/, services/, types/)                  │
└─────────────────────────────────────────────────────┘
```

### Folder Structure

```
src/
├── pages/                   # Route-level containers
│   ├── Home/
│   ├── Dashboard/
│   ├── Products/
│   └── UserProfile/
│
├── features/                # Domain-specific modules
│   ├── auth/
│   │   └── components/
│   ├── products/
│   │   └── components/
│   ├── user/
│   │   └── components/
│   └── dashboard/
│       └── components/
│
├── components/              # Generic, reusable components
│   ├── common/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Card/
│   └── layout/
│       ├── Header/
│       ├── Footer/
│       └── Sidebar/
│
├── atoms/                   # Centralized state management
├── services/               # API services
└── types/                  # TypeScript types
```

---

## Pages Layer

### Purpose
Route-level containers that represent entire screens. Pure presentation orchestration with **no business logic**.

### Characteristics
- ✅ Maps 1:1 with application routes
- ✅ Imports state from centralized atoms
- ✅ Composes feature components
- ✅ Handles page-level layout
- ❌ No direct service calls
- ❌ No business logic
- ❌ No state mutations

### Structure
```
src/pages/
├── Products/
│   ├── index.tsx           # Main page component
│   ├── ProductList.tsx     # Page-specific component
│   ├── ProductDetail.tsx   # Page-specific component
│   └── Products.styles.ts  # Page-specific styles
└── Dashboard/
    ├── index.tsx
    └── components/         # Page-specific components only
        ├── DashboardHeader.tsx
        └── DashboardStats.tsx
```

### Example
```typescript
// src/pages/Products/index.tsx
import React from 'react';
import { useAtomValue, useAtomState } from '@zedux/react';

// Import state from centralized atoms
import { sortedAndFilteredProductsIon } from '@/atoms/products/productsIons';
import { filtersAtom } from '@/atoms/products/productsAtoms';

// Import feature components
import { ProductFilters, ProductGrid } from '@/features/products/components';

// Import layout components
import { Layout } from '@/components/layout/Layout';

export const ProductsPage = () => {
  const products = useAtomValue(sortedAndFilteredProductsIon);
  const [filters, setFilters] = useAtomState(filtersAtom);

  return (
    <Layout>
      <div className="products-page">
        <h1>Products</h1>
        
        {/* Orchestrate feature components */}
        <ProductFilters 
          filters={filters} 
          onFilterChange={setFilters} 
        />
        
        <ProductGrid products={products} />
      </div>
    </Layout>
  );
};
```

### When to Use Pages
- Creating a new route/screen
- Need to orchestrate multiple features
- Handling layout at the screen level
- Setting up page-specific providers or context

---

## Features Layer

### Purpose
Domain-specific UI modules that encapsulate related functionality. Contains business logic and state interactions for specific domains.

### Characteristics
- ✅ Domain-specific (auth, products, users, orders)
- ✅ Can interact with atoms/state
- ✅ Reusable across multiple pages
- ✅ Contains domain business logic
- ✅ Uses shared components internally
- ❌ Not tied to specific routes
- ❌ No generic UI concerns

### Structure
```
src/features/
├── auth/
│   └── components/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── ForgotPassword.tsx
│       └── UserAvatar.tsx
├── products/
│   └── components/
│       ├── ProductCard.tsx
│       ├── ProductGrid.tsx
│       ├── ProductFilters.tsx
│       ├── AddToCartButton.tsx
│       └── ProductSearch.tsx
├── user/
│   └── components/
│       ├── UserProfile.tsx
│       ├── UserSettings.tsx
│       └── UserPreferences.tsx
└── dashboard/
    └── components/
        ├── DashboardStats.tsx
        ├── RecentOrders.tsx
        └── ActivityFeed.tsx
```

### Example
```typescript
// src/features/products/components/ProductCard.tsx
import React from 'react';
import { useAtomState } from '@zedux/react';

// Import centralized types
import { Product } from '@/types/products/product.types';

// Import centralized state
import { cartAtom } from '@/atoms/products/cartAtoms';

// Import shared components
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export const ProductCard = ({ product, showAddToCart = true }: ProductCardProps) => {
  const [cart, cartActions] = useAtomState(cartAtom);

  const handleAddToCart = () => {
    // Domain-specific business logic
    cartActions.addItem({
      productId: product.id,
      quantity: 1,
      price: product.price
    });
  };

  const isInCart = cart.items.some(item => item.productId === product.id);

  return (
    <Card className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price}</p>
      <p className="description">{product.description}</p>
      
      {showAddToCart && (
        <Button 
          onClick={handleAddToCart}
          disabled={isInCart || product.inventory === 0}
          variant={isInCart ? 'secondary' : 'primary'}
        >
          {isInCart ? 'In Cart' : 'Add to Cart'}
        </Button>
      )}
    </Card>
  );
};
```

### When to Use Features
- Building domain-specific functionality
- Creating reusable business components
- Need to interact with domain-specific state
- Building components used across multiple pages
- Implementing domain business rules

---

## Components Layer

### Purpose
Pure, reusable UI building blocks with no business logic. Generic components that form the foundation of the design system.

### Characteristics
- ✅ Generic and domain-agnostic
- ✅ Highly reusable
- ✅ Pure presentation
- ✅ Well-documented props
- ✅ Consistent styling
- ❌ No business logic
- ❌ No direct state management
- ❌ No domain knowledge

### Structure
```
src/components/
├── common/
│   ├── Button/
│   │   ├── index.tsx
│   │   ├── Button.styles.ts
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
│   ├── Input/
│   ├── Modal/
│   ├── Card/
│   ├── Spinner/
│   └── ErrorBoundary/
├── layout/
│   ├── Header/
│   ├── Footer/
│   ├── Sidebar/
│   └── Layout.tsx
└── forms/
    ├── FormField/
    ├── FormGroup/
    └── FormValidation/
```

### Example
```typescript
// src/components/common/Button/index.tsx
import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = 'btn';
  const variantClasses = `btn--${variant}`;
  const sizeClasses = `btn--${size}`;
  const fullWidthClasses = fullWidth ? 'btn--full-width' : '';
  const loadingClasses = loading ? 'btn--loading' : '';

  const combinedClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    fullWidthClasses,
    loadingClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="small" />}
      {children}
    </button>
  );
};
```

### When to Use Components
- Building generic UI elements
- Creating design system components
- Need maximum reusability across domains
- Building pure presentation elements
- Implementing consistent styling patterns

---

## Decision Matrix

| Need | Page | Feature | Component |
|------|------|---------|-----------|
| **Route-level layout** | ✅ | ❌ | ❌ |
| **Domain business logic** | ❌ | ✅ | ❌ |
| **State management** | ❌ | ✅ | ❌ |
| **Cross-domain reuse** | ❌ | ❌ | ✅ |
| **Pure UI element** | ❌ | ❌ | ✅ |
| **Compose other components** | ✅ | ✅ | ❌ |
| **API interactions** | ❌ | ✅ | ❌ |
| **Business rules** | ❌ | ✅ | ❌ |
| **Design system** | ❌ | ❌ | ✅ |

## Quick Decision Guide

### Ask Yourself:

1. **Is this a route/screen?** → **Page**
2. **Is this domain-specific business logic?** → **Feature**
3. **Is this a reusable UI element?** → **Component**

### Examples by Category:

**Pages:**
- Dashboard page
- Product listing page  
- User profile page
- Checkout page

**Features:**
- Login form
- Product card with add-to-cart
- User avatar with dropdown menu
- Shopping cart sidebar
- Order status tracker

**Components:**
- Button, Input, Modal
- Loading spinner, tooltip
- Header, Footer, Layout
- Table, Card, Badge

---

## Real-World Examples

### E-commerce Product Page

```typescript
// PAGE: Product listing route
// src/pages/Products/index.tsx
export const ProductsPage = () => {
  const products = useAtomValue(filteredProductsIon);
  const [filters, setFilters] = useAtomState(filtersAtom);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <Layout>
      <div className="products-page">
        <PageHeader title="Products" />
        
        <div className="products-controls">
          <ProductFilters 
            filters={filters} 
            onFilterChange={setFilters} 
          />
          <ViewToggle 
            view={view} 
            onViewChange={setView} 
          />
        </div>
        
        <ProductGrid 
          products={products} 
          view={view} 
        />
      </div>
    </Layout>
  );
};

// FEATURE: Domain-specific product functionality
// src/features/products/components/ProductGrid.tsx
export const ProductGrid = ({ products, view }: ProductGridProps) => {
  const [sortBy, setSortBy] = useAtomState(productSortAtom);

  if (products.length === 0) {
    return (
      <Card>
        <EmptyState 
          title="No products found"
          description="Try adjusting your filters"
          action={<Button onClick={clearFilters}>Clear Filters</Button>}
        />
      </Card>
    );
  }

  return (
    <div className={`product-grid product-grid--${view}`}>
      <SortControls 
        sortBy={sortBy} 
        onSortChange={setSortBy} 
      />
      
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product}
          view={view}
        />
      ))}
    </div>
  );
};

// COMPONENT: Generic, reusable UI
// src/components/common/EmptyState/index.tsx
export const EmptyState = ({ title, description, action, icon }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && (
        <div className="empty-state__action">{action}</div>
      )}
    </div>
  );
};
```

### Dashboard Example

```typescript
// PAGE: Dashboard route orchestration
// src/pages/Dashboard/index.tsx
export const DashboardPage = () => {
  const user = useAtomValue(currentUserAtom);
  
  return (
    <Layout>
      <PageHeader 
        title={`Welcome back, ${user.firstName}`}
        subtitle="Here's what's happening with your business"
      />
      
      <div className="dashboard-grid">
        <DashboardStats />
        <RecentOrders />
        <ActivityFeed />
        <QuickActions />
      </div>
    </Layout>
  );
};

// FEATURE: Business-specific dashboard widget
// src/features/dashboard/components/DashboardStats.tsx
export const DashboardStats = () => {
  const stats = useAtomValue(dashboardStatsAtom);
  const { loading, error } = useAtomValue(dashboardLoadingAtom);

  if (loading) return <Spinner size="large" />;
  if (error) return <ErrorCard error={error} />;

  return (
    <Card>
      <CardHeader title="Business Overview" />
      <div className="stats-grid">
        <StatItem
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          trend={stats.revenueTrend}
          icon={<DollarIcon />}
        />
        <StatItem
          label="Orders"
          value={stats.orderCount.toLocaleString()}
          trend={stats.orderTrend}
          icon={<OrderIcon />}
        />
        <StatItem
          label="Customers"
          value={stats.customerCount.toLocaleString()}
          trend={stats.customerTrend}
          icon={<UserIcon />}
        />
      </div>
    </Card>
  );
};

// COMPONENT: Generic stat display
// src/components/common/StatItem/index.tsx
export const StatItem = ({ label, value, trend, icon }: StatItemProps) => {
  const trendColor = trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral';
  
  return (
    <div className="stat-item">
      <div className="stat-item__icon">{icon}</div>
      <div className="stat-item__content">
        <div className="stat-item__value">{value}</div>
        <div className="stat-item__label">{label}</div>
        {trend !== undefined && (
          <div className={`stat-item__trend stat-item__trend--${trendColor}`}>
            <TrendIcon direction={trend > 0 ? 'up' : 'down'} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## Best Practices

### Pages Best Practices

1. **Keep pages thin** - Only orchestration and layout
2. **Use descriptive names** - Match route names
3. **Import from centralized atoms** - Never duplicate state
4. **Compose, don't implement** - Use feature components

```typescript
// ✅ Good: Thin page that orchestrates
export const ProductsPage = () => {
  return (
    <Layout>
      <ProductFilters />
      <ProductGrid />
    </Layout>
  );
};

// ❌ Bad: Page with business logic
export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // API call in page - belongs in atom/service
    productService.getProducts().then(setProducts);
  }, []);
  
  // Complex filtering logic - belongs in feature
  const filteredProducts = products.filter(p => /* logic */);
  
  return <div>{/* render */}</div>;
};
```

### Features Best Practices

1. **Single domain focus** - Auth, products, users, etc.
2. **Encapsulate business logic** - Keep domain rules together
3. **Use atoms for state** - Connect to centralized state
4. **Compose from components** - Reuse generic UI elements

```typescript
// ✅ Good: Domain-focused with business logic
export const ProductCard = ({ product }: { product: Product }) => {
  const [cart, cartActions] = useAtomState(cartAtom);
  
  const handleAddToCart = () => {
    // Domain business logic
    if (product.inventory === 0) {
      showNotification('Product out of stock');
      return;
    }
    cartActions.addItem(product);
  };
  
  return (
    <Card>
      <Button onClick={handleAddToCart}>Add to Cart</Button>
    </Card>
  );
};

// ❌ Bad: Too generic for features layer
export const GenericCard = ({ title, content }: GenericCardProps) => {
  return <div>{title} - {content}</div>;
};
```

### Components Best Practices

1. **Stay generic** - No domain knowledge
2. **Well-defined props** - Clear, documented interfaces
3. **Consistent styling** - Follow design system
4. **Composable** - Work well together

```typescript
// ✅ Good: Generic, reusable component
export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) => {
  return (
    <button 
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// ❌ Bad: Too specific for components layer
export const AddToCartButton = ({ product }: { product: Product }) => {
  // This belongs in features layer
  const addToCart = () => { /* business logic */ };
  return <button onClick={addToCart}>Add {product.name} to Cart</button>;
};
```

### Import Guidelines

```typescript
// ✅ Good: Clear import hierarchy
import React from 'react';

// 1. External libraries
import { useAtomValue } from '@zedux/react';

// 2. Centralized business logic
import { Product } from '@/types/products/product.types';
import { cartAtom } from '@/atoms/products/cartAtoms';

// 3. Feature components (if in page)
import { ProductCard } from '@/features/products/components';

// 4. Generic components
import { Button, Card } from '@/components/common';

// 5. Utilities
import { formatCurrency } from '@/utils/formatters';
```

---

## Migration Guide

### From Monolithic Components

1. **Identify current component types**:
   - Route components → Move to `pages/`
   - Domain-specific components → Move to `features/`
   - Generic UI components → Move to `components/`

2. **Extract business logic**:
   - Move state management to `atoms/`
   - Move API calls to `services/`
   - Keep only presentation in components

3. **Refactor imports**:
   - Update import paths
   - Use barrel exports
   - Follow import hierarchy

### Example Migration

```typescript
// Before: Monolithic component
const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({});
  
  useEffect(() => {
    fetch('/api/products').then(/* ... */);
  }, []);
  
  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };
  
  return (
    <div>
      {/* Mixed concerns */}
      <input onChange={handleFilter} />
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <button onClick={() => addToCart(product)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};
```

```typescript
// After: Separated concerns

// PAGE: Orchestration only
// src/pages/Products/index.tsx
export const ProductsPage = () => {
  return (
    <Layout>
      <ProductFilters />
      <ProductGrid />
    </Layout>
  );
};

// FEATURE: Domain-specific logic
// src/features/products/components/ProductCard.tsx
export const ProductCard = ({ product }: { product: Product }) => {
  const [cart, cartActions] = useAtomState(cartAtom);
  
  return (
    <Card>
      <h3>{product.name}</h3>
      <Button onClick={() => cartActions.addItem(product)}>
        Add to Cart
      </Button>
    </Card>
  );
};

// COMPONENT: Generic UI
// src/components/common/Card/index.tsx
export const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="card">{children}</div>;
};

// ATOM: Centralized state
// src/atoms/products/cartAtoms.ts
export const cartAtom = atom('cart', () => {
  const store = injectStore({ items: [] });
  
  const addItem = (product: Product) => {
    store.setState(state => ({
      items: [...state.items, product]
    }));
  };
  
  return { store, addItem };
});
```

---

## Troubleshooting

### Common Issues

**"Where does this component belong?"**
- Does it handle routing? → Page
- Is it domain-specific? → Feature
- Is it reusable UI? → Component

**"Component is getting too complex"**
- Extract business logic to atoms
- Move domain logic to features
- Keep UI concerns in components

**"Too much prop drilling"**
- Use atoms for shared state
- Compose features instead of passing props
- Consider React Context for component-only state

**"Hard to test"**
- Mock atoms for feature tests
- Test components in isolation
- Use service mocks for integration tests

**"Unclear dependencies"**
- Follow import hierarchy rules
- Use barrel exports
- Keep dependencies explicit

---

## Conclusion

This three-layer architecture provides:

- **Clear boundaries** between route orchestration, business logic, and UI
- **Predictable structure** - developers know where code belongs
- **Better reusability** - each layer optimized for its purpose
- **Easier testing** - isolated concerns are easier to test
- **Scalable growth** - new features fit into existing patterns

By following these guidelines, your React application will have a clean, maintainable architecture that scales with your team and business needs.