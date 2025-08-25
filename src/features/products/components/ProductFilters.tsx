import { useAtomState } from '@zedux/react';
import { filtersAtom, sortingAtom, productsAtom } from '@/atoms/products/productsAtoms';
import { Input, Button } from '@/components/common';
import './ProductFilters.css';

export const ProductFilters = () => {
  const [filters, setFilters] = useAtomState(filtersAtom);
  const [sorting, setSorting] = useAtomState(sortingAtom);
  const [productsData] = useAtomState(productsAtom);
  
  const { categories } = productsData.store.getState();
  const { loadProducts } = productsData;

  const handleSearchChange = (value: string) => {
    setFilters(state => ({ ...state, searchQuery: value }));
    loadProducts({ search: value, category: filters.categories.join(',') });
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as ['name' | 'price' | 'createdAt', 'asc' | 'desc'];
    setSorting({ field, direction });
    // Reload products with new sorting
    loadProducts({ search: filters.searchQuery });
  };

  const handleCategoryChange = (value: string) => {
    const updatedCategories = value ? [value] : [];
    setFilters(state => ({ ...state, categories: updatedCategories }));
    loadProducts({ 
      search: filters.searchQuery, 
      category: value 
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