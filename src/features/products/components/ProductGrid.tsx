import { useState, useEffect } from 'react';
import { productService } from '@/services/products/productService';
import { Product } from '@/types/product.types';
import { ProductCard } from './ProductCard';
import './ProductGrid.css';

export const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="product-grid__loading">
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-grid__error">
        <h3>Error loading products</h3>
        <p>{error}</p>
        <p>Make sure the mock server is running on port 3001</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid__empty">
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};