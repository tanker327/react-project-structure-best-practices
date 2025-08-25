import { atom, injectStore, injectEffect, api } from '@zedux/react';
import { productService } from '@/services/products/productService';
import { Product } from '@/types/product.types';
import { ApiError } from '@/services/api/errorHandler';

export const productsAtom = atom('products', () => {
  const store = injectStore({
    items: [] as Product[],
    loading: false,
    error: null as string | null,
    categories: [] as string[],
  });

  const loadProducts = async (filters?: any) => {
    store.setState(state => ({ ...state, loading: true, error: null }));
    
    try {
      const products = await productService.getProducts(filters);
      const categories = await productService.getCategories();
      
      store.setState({
        items: products,
        categories,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Failed to load products:', err);
      
      let errorMessage = 'Failed to load products';
      
      if (err instanceof ApiError) {
        // Handle different types of API errors
        switch (err.code) {
          case 'NETWORK_ERROR':
            errorMessage = 'Network error. Please check your connection and ensure the mock server is running on port 3001.';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = 'Invalid data received from server. Please try again.';
            break;
          default:
            errorMessage = `Error ${err.statusCode}: ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      store.setState(state => ({
        ...state,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  // Load products on mount
  injectEffect(() => {
    loadProducts();
  }, []);

  return api(store).setExports({
    loadProducts,
  });
});

export const filtersAtom = atom('productFilters', () => {
  return injectStore({
    searchQuery: '',
    categories: [] as string[],
    priceRange: { min: 0, max: 1000 },
    inStockOnly: false,
    isActiveOnly: true,
  });
});

export const sortingAtom = atom('productSorting', () => {
  return injectStore({
    field: 'name' as 'name' | 'price' | 'createdAt',
    direction: 'asc' as 'asc' | 'desc',
  });
});

export const cartAtom = atom('cart', () => {
  type CartItem = { product: Product; quantity: number; addedAt: Date };
  
  return injectStore({
    items: [] as CartItem[],
    total: 0,
    itemCount: 0,
  });
});