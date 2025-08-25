export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    BULK: '/products/bulk',
    RESET: '/products/reset',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: number) => `/users/${id}`,
  },
} as const;