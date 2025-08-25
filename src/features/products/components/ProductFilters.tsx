import { useAtomState } from '@zedux/react';
import { filtersAtom, sortingAtom, productsAtom } from '@/atoms/products/productsAtoms';
import { Input, Button } from '@/components/common';
import './ProductFilters.css';

export const ProductFilters = () => {
  const [filters, setFilters] = useAtomState(filtersAtom);
  const [sorting, setSorting] = useAtomState(sortingAtom);
  const [{ categories }, { loadProducts }] = useAtomState(productsAtom);

  const handleSearchChange = (value: string) => {
    setFilters(state => ({ ...state, searchQuery: value }));
    // Use the new value directly, not the stale state
    loadProducts({ 
      search: value, 
      category: filters.categories.length > 0 ? filters.categories[0] : undefined 
    });
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as ['name' | 'price' | 'createdAt', 'asc' | 'desc'];
    setSorting({ field, direction });
    // Now sorting is implemented in the backend!
    loadProducts({ 
      search: filters.searchQuery,
      category: filters.categories.length > 0 ? filters.categories[0] : undefined,
      sortBy: field,
      sortDirection: direction
    });
  };

  const handleCategoryChange = (value: string) => {
    const updatedCategories = value ? [value] : [];
    setFilters(state => ({ ...state, categories: updatedCategories }));
    // Use the new value directly
    loadProducts({ 
      search: filters.searchQuery, 
      category: value || undefined
    });
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      categories: [],
      priceRange: { min: 0, max: 1000 },
      inStockOnly: false,
      isActiveOnly: true,
    });
    setSorting({
      field: 'name',
      direction: 'asc',
    });
    loadProducts(); // Reload without filters
  };

  return (
    <div className="product-filters">
      <div className="product-filters__row">
        <Input
          type="text"
          placeholder="Search products..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="product-filters__search"
        />

        <select
          value={`${sorting.field}-${sorting.direction}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="product-filters__sort"
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-asc">Price Low-High</option>
          <option value="price-desc">Price High-Low</option>
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
        </select>

        <select
          className="product-filters__category"
          value={filters.categories[0] || ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat: string) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <Button onClick={handleClearFilters} variant="ghost" size="small">
          Clear Filters
        </Button>
      </div>
    </div>
  );
};