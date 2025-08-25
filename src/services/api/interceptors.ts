import { AxiosInstance } from 'axios';
import { handleApiError } from './errorHandler';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export const setupInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config) => {
      if (authToken && config.headers) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      config.headers['X-Request-ID'] = crypto.randomUUID();
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Handle authentication errors
      if (error.response?.status === 401) {
        authToken = null;
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      
      // Convert to typed ApiError
      const apiError = handleApiError(error);
      
      // Log error for debugging (only in development)
      if (import.meta.env.DEV) {
        console.error('API Error:', {
          message: apiError.message,
          statusCode: apiError.statusCode,
          code: apiError.code,
          details: apiError.details,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase()
        });
      }
      
      return Promise.reject(apiError);
    }
  );
};