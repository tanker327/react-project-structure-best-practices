import { z } from 'zod';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../endpoints';
import { setAuthToken } from '../api/interceptors';
import { loginRequestSchema } from '@/schemas/auth.schemas';
import type { LoginRequest } from '@/types/auth.types';
import { HandleError, ServiceErrorHandler } from '../decorators/errorHandler.decorator';

const loginResponseSchema = z.object({
  token: z.string(),
});

type LoginResponse = z.infer<typeof loginResponseSchema>;

@ServiceErrorHandler('AuthService')
class AuthService {
  @HandleError()
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const validatedCredentials = loginRequestSchema.parse(credentials);
    
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      validatedCredentials
    );

    const validatedResponse = loginResponseSchema.parse(response);
    
    this.storeToken(validatedResponse.token);
    setAuthToken(validatedResponse.token);
    
    return validatedResponse;
  }

  @HandleError()
  async logout(): Promise<void> {
    this.clearToken();
    setAuthToken(null);
  }

  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();