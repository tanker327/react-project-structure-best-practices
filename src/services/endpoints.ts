export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: number) => `/products/${id}`,
    CATEGORIES: '/products/categories',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: number) => `/users/${id}`,
  },
} as const;