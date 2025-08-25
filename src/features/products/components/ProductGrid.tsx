import { useAtomValue } from '@zedux/react';
import { productsAtom } from '@/atoms/products/productsAtoms';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product.types';
import './ProductGrid.css';

export const ProductGrid = () => {
  const { store } = useAtomValue(productsAtom);
  const { items: products, loading, error } = store.getState();

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
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};