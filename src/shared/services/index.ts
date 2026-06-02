import {
  LocalStorageProductService,
  LocalStorageCategoryService,
  LocalStorageOrderService,
  LocalStorageAuthService,
} from './localStorage';
import { SupabaseCategoryService } from './supabase/categoryService';
import { SupabaseProductService } from './supabase/productService';
import { SupabaseOrderService } from './supabase/orderService';
import type { ProductService, CategoryService, OrderService, AuthService } from './interfaces';

const useSupabase = !!import.meta.env.VITE_SUPABASE_URL;

export const productService: ProductService = useSupabase
  ? new SupabaseProductService()
  : new LocalStorageProductService();
export const categoryService: CategoryService = useSupabase
  ? new SupabaseCategoryService()
  : new LocalStorageCategoryService();
export const orderService: OrderService = useSupabase
  ? new SupabaseOrderService()
  : new LocalStorageOrderService();
export const authService: AuthService = new LocalStorageAuthService();

export type { ProductService, CategoryService, OrderService, AuthService };
