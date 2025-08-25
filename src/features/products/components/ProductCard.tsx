import { useAtomState } from '@zedux/react';
import { cartAtom } from '@/atoms/products/productsAtoms';
import { Product } from '@/types/product.types';
import { Button, Card } from '@/components/common';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export const ProductCard = ({ product, showAddToCart = true }: ProductCardProps) => {
  const [cart, setCart] = useAtomState(cartAtom);
  const { items } = cart;
  
  // Check if product is already in cart
  const isInCart = items.some((item: any) => item.product.id === product.id);

  const handleAddToCart = () => {
    if (!isInCart) {
      const newItem = {
        product,
        quantity: 1,
        addedAt: new Date(),
      };
      
      const updatedItems = [...items, newItem];
      const total = updatedItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
      const itemCount = updatedItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
      
      setCart({
        items: updatedItems,
        total,
        itemCount,
      });
      
      console.log('Added to cart:', product.name);
    }
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