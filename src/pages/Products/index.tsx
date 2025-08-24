import { ProductFilters, ProductGrid } from '@/features/products/components';

export const ProductsPage = () => {
  return (
    <div className="products-page">
      <h1>Products</h1>
      
      <ProductFilters />
      <ProductGrid />
    </div>
  );
};