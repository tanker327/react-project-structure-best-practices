import { atom, injectStore } from '@zedux/react';
import { authService } from '@/services/auth/authService';
import type { LoginRequest } from '@/types/auth.types';

export const authStateAtom = atom('authState', () => {
  const store = injectStore({
    user: null as any,
    token: null as string | null,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
  });

  const login = async (credentials: LoginRequest) => {
    store.setState(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const response = await authService.login(credentials);
      store.setState({
        user: { username: credentials.username }, // Demo user object
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      store.setState(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      store.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const clearError = () => {
    store.setState(state => ({ ...state, error: null }));
  };

  return { store, login, logout, clearError };
});