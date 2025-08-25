import { z } from 'zod';
import { productSchema, categorySchema } from '@/schemas/product.schemas';

export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;

export type ProductFilter = {
  searchQuery?: string;
  categories: string[];
  priceRange: { min: number; max: number };
  inStockOnly: boolean;
  isActiveOnly?: boolean;
};

export type ProductSort = {
  field: 'name' | 'price' | 'createdAt';
  direction: 'asc' | 'desc';
};

export type CartItem = {
  product: Product;
  quantity: number;
  addedAt: Date;
};

export type Cart = {
  items: CartItem[];
  total: number;
  itemCount: number;
};