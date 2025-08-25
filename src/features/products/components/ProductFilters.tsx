import { useState } from 'react';
import { Input, Button } from '@/components/common';
import './ProductFilters.css';

export const ProductFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Mock categories for demo
  const categories = ['Electronics', 'Furniture', 'Sports & Outdoors', 'Home & Kitchen'];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // In real app, would trigger product filtering
    console.log('Search:', value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // In real app, would trigger product sorting
    console.log('Sort:', value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // In real app, would trigger product filtering
    console.log('Category:', value);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('name-asc');
    setSelectedCategory('');
  };

  return (
    <div className="product-filters">
      <div className="product-filters__row">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="product-filters__search"
        />

        <select
          value={sortBy}
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
          value={selectedCategory}
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