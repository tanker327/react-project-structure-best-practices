import { z } from 'zod';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../endpoints';
import { productSchema } from '@/schemas/product.schemas';
import { Product } from '@/types/product.types';

const getProductsRequestSchema = z.object({
  limit: z.number().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});

const getProductsResponseSchema = z.array(productSchema);

const getCategoriesResponseSchema = z.array(z.string());

type GetProductsRequest = z.infer<typeof getProductsRequestSchema>;
type GetProductsResponse = z.infer<typeof getProductsResponseSchema>;
type GetCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>;

class ProductService {
  async getProducts(filters?: GetProductsRequest): Promise<GetProductsResponse> {
    const validatedFilters = filters 
      ? getProductsRequestSchema.parse(filters) 
      : undefined;

    const response = await apiClient.get<GetProductsResponse>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: validatedFilters }
    );

    return getProductsResponseSchema.parse(response);
  }

  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );

    return productSchema.parse(response);
  }

  async getCategories(): Promise<GetCategoriesResponse> {
    const response = await apiClient.get<GetCategoriesResponse>(
      API_ENDPOINTS.PRODUCTS.CATEGORIES
    );

    return getCategoriesResponseSchema.parse(response);
  }

  async getProductsByCategory(category: string, limit?: number): Promise<Product[]> {
    const response = await this.getProducts({ limit });
    return response.filter(product => product.category === category);
  }
}

export const productService = new ProductService();