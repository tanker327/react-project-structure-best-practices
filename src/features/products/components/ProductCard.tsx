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
    setIsInCart(true);
    console.log('Added to cart:', product.title);
    // In a real app, this would update the cart state
    setTimeout(() => setIsInCart(false), 2000); // Reset after 2 seconds for demo
  };

  return (
    <Card className="product-card" padding="medium">
      <div className="product-card__image">
        <img src={product.image} alt={product.title} />
      </div>
      
      <div className="product-card__content">
        <h3 className="product-card__title">{product.title}</h3>
        <p className="product-card__category">{product.category}</p>
        <p className="product-card__description">{product.description}</p>
        
        <div className="product-card__footer">
          <div className="product-card__price">${product.price}</div>
          <div className="product-card__rating">
            ⭐ {product.rating.rate} ({product.rating.count})
          </div>
        </div>

        {showAddToCart && (
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