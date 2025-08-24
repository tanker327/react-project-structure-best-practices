import { atom, injectStore } from '@zedux/react';

// Simplified demo atoms - just showing the structure
export const productsAtom = atom('products', () => {
  return injectStore({
    items: [],
    loading: false,
    error: null,
    categories: [],
  });
});

export const filtersAtom = atom('productFilters', () => {
  return injectStore({
    searchQuery: '',
    categories: [],
    priceRange: { min: 0, max: 1000 },
    inStockOnly: false,
  });
});

export const sortingAtom = atom('productSorting', () => {
  return injectStore({
    field: 'title',
    direction: 'asc',
  });
});

export const cartAtom = atom('cart', () => {
  return injectStore({
    items: [],
    total: 0,
    itemCount: 0,
  });
});