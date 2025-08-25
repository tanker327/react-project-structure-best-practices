import { z } from 'zod';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../endpoints';
import { productSchema } from '@/schemas/product.schemas';
import { Product } from '@/types/product.types';

const getProductsRequestSchema = z.object({
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  search: z.string().optional(),
});

const getProductsResponseSchema = z.object({
  items: z.array(productSchema),
  total: z.number(),
  timestamp: z.string(),
});

const getCategoriesResponseSchema = z.array(z.string());

type GetProductsRequest = z.infer<typeof getProductsRequestSchema>;
type GetProductsResponse = z.infer<typeof getProductsResponseSchema>;
type CreateProductRequest = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateProductRequest = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;
type GetCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>;

class ProductService {
  async getProducts(filters?: GetProductsRequest): Promise<Product[]> {
    const validatedFilters = filters 
      ? getProductsRequestSchema.parse(filters) 
      : undefined;

    const response = await apiClient.get<GetProductsResponse>(
      API_ENDPOINTS.PRODUCTS.LIST,
      { params: validatedFilters }
    );

    const validatedResponse = getProductsResponseSchema.parse(response);
    return validatedResponse.items;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );

    return productSchema.parse(response);
  }

  async getCategories(): Promise<GetCategoriesResponse> {
    // Extract unique categories from products
    const products = await this.getProducts();
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      product
    );
    return productSchema.parse(response);
  }

  async updateProduct(id: string, updates: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.patch<Product>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      updates
    );
    return productSchema.parse(response);
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.getProducts({ category });
  }

  async searchProducts(search: string): Promise<Product[]> {
    return this.getProducts({ search });
  }
}

export const productService = new ProductService();