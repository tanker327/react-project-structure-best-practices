import { atom, injectStore, injectEffect } from '@zedux/react';
import { productService } from '@/services/products/productService';
import { Product } from '@/types/product.types';

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
    } catch (error) {
      console.error('Failed to load products:', error);
      store.setState(state => ({
        ...state,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load products',
      }));
    }
  };

  // Load products on mount
  injectEffect(() => {
    loadProducts();
  }, []);

  return store;
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