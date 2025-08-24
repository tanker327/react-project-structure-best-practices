import { useState } from 'react';
import { Input, Button } from '@/components/common';
import './ProductFilters.css';

export const ProductFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title-asc');

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('title-asc');
  };

  return (
    <div className="product-filters">
      <div className="product-filters__row">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="product-filters__search"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="product-filters__sort"
        >
          <option value="title-asc">Name A-Z</option>
          <option value="title-desc">Name Z-A</option>
          <option value="price-asc">Price Low-High</option>
          <option value="price-desc">Price High-Low</option>
          <option value="rating.rate-desc">Rating High-Low</option>
        </select>

        <Button onClick={handleClearFilters} variant="ghost" size="small">
          Clear Filters
        </Button>
      </div>
    </div>
  );
};