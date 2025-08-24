import { useState } from 'react';
import { Button, Input, Card } from '@/components/common';
import './LoginForm.css';

export const LoginForm = () => {
  const [username, setUsername] = useState('mor_2314');
  const [password, setPassword] = useState('83r5^_');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Demo login:', { username, password });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Login successful! (This is a demo)');
    } catch (error: any) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="login-form" padding="large">
      <h2 className="login-form__title">Login</h2>
      <p className="login-form__subtitle">
        Demo credentials: mor_2314 / 83r5^_
      </p>
      
      <form onSubmit={handleSubmit} className="login-form__form">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
        />
        
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
        />

        {error && (
          <div className="login-form__error">
            {error}
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="large"
        >
          Login
        </Button>
      </form>
    </Card>
  );
};