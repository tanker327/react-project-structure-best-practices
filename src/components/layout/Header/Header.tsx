import { Link } from 'react-router-dom';
import { Button } from '@/components/common';
import './Header.css';

export const Header = () => {
  const itemCount = 0; // Demo value
  const isAuthenticated = false; // Demo value

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          React Demo
        </Link>
        
        <nav className="header__nav">
          <Link to="/" className="header__nav-link">
            Home
          </Link>
          <Link to="/products" className="header__nav-link">
            Products
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="header__nav-link">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="header__actions">
          <Link to="/cart" className="header__cart">
            🛒 {itemCount > 0 && <span className="header__cart-count">{itemCount}</span>}
          </Link>
          
          {isAuthenticated ? (
            <div className="header__user">
              👤 Welcome!
            </div>
          ) : (
            <Link to="/login">
              <Button size="small">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};