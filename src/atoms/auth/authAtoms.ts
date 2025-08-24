import { atom, injectStore } from '@zedux/react';

// Simplified demo - just showing the structure
export const authStateAtom = atom('authState', () => {
  return injectStore({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
});