import { useState } from 'react';
import { useAtomState } from '@zedux/react';
import { authStateAtom } from '@/atoms/auth/authAtoms';
import { Button, Input, Card } from '@/components/common';
import './LoginForm.css';

export const LoginForm = () => {
  const [username, setUsername] = useState('mor_2314');
  const [password, setPassword] = useState('83r5^_');
  const [{ isLoading, error }, { login }] = useAtomState(authStateAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ username, password });
      alert('Login successful! (This is a demo)');
    } catch (err) {
      // Error is already handled by the atom
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
          loading={isLoading}
          fullWidth
          size="large"
        >
          Login
        </Button>
      </form>
    </Card>
  );
};