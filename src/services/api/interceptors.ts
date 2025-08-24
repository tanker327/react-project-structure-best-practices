import { AxiosInstance } from 'axios';

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
      if (error.response?.status === 401) {
        authToken = null;
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );
};