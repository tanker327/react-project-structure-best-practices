import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/common';
import './Home.css';

export const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-page__hero">
        <h1 className="home-page__title">
          React Project Structure Demo
        </h1>
        <p className="home-page__subtitle">
          A demonstration of best practices for large-scale React applications
        </p>
        <div className="home-page__actions">
          <Link to="/products">
            <Button size="large">Browse Products</Button>
          </Link>
          <Link to="/login">
            <Button size="large" variant="ghost">Login</Button>
          </Link>
        </div>
      </div>

      <div className="home-page__features">
        <Card padding="large">
          <h3>🏗️ Three-Layer Architecture</h3>
          <p>
            Clean separation between Pages (routing), Features (business logic), 
            and Components (reusable UI elements).
          </p>
        </Card>

        <Card padding="large">
          <h3>⚡ Zedux State Management</h3>
          <p>
            Atomic state management with dependency injection and plugin system 
            for scalable applications.
          </p>
        </Card>

        <Card padding="large">
          <h3>🔒 Type-Safe APIs</h3>
          <p>
            Zod schema validation ensures runtime type safety for all API 
            requests and responses.
          </p>
        </Card>

        <Card padding="large">
          <h3>🎯 Centralized Services</h3>
          <p>
            All business logic centralized in services layer with automatic 
            validation and error handling.
          </p>
        </Card>
      </div>
    </div>
  );
};