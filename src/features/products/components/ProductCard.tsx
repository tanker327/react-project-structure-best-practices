import { useState } from 'react';
import { Product } from '@/types/product.types';
import { Button, Card } from '@/components/common';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export const ProductCard = ({ product, showAddToCart = true }: ProductCardProps) => {
  const [isInCart, setIsInCart] = useState(false);

  const handleAddToCart = () => {
    // Simplified for demo - in real app would update cart atom
    setIsInCart(true);
    console.log('Added to cart:', product.name);
    setTimeout(() => setIsInCart(false), 2000); // Reset after 2 seconds for demo
  };

  return (
    <Card className="product-card" padding="medium">
      {/* Using a placeholder image since our mock data doesn't have images */}
      <div className="product-card__image">
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: '4px'
        }}>
          <span style={{ color: '#999' }}>Product Image</span>
        </div>
      </div>
      
      <div className="product-card__content">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__category">{product.category}</p>
        <p className="product-card__description">{product.description || 'No description available'}</p>
        
        <div className="product-card__footer">
          <div className="product-card__price">${product.price.toFixed(2)}</div>
          <div className="product-card__inventory">
            {product.inventory > 0 ? (
              <span style={{ color: product.inventory < 10 ? '#ff9800' : '#4caf50' }}>
                {product.inventory < 10 ? `Only ${product.inventory} left` : 'In Stock'}
              </span>
            ) : (
              <span style={{ color: '#f44336' }}>Out of Stock</span>
            )}
          </div>
        </div>

        {showAddToCart && product.isActive && product.inventory > 0 && (
          <Button 
            onClick={handleAddToCart}
            disabled={isInCart}
            variant={isInCart ? 'secondary' : 'primary'}
            fullWidth
            className="product-card__button"
          >
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
        )}
      </div>
    </Card>
  );
};