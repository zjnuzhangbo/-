import {
  LocalStorageProductService,
  LocalStorageCategoryService,
  LocalStorageOrderService,
  LocalStorageAuthService,
} from './localStorage';
import type { ProductService, CategoryService, OrderService, AuthService } from './interfaces';

export const productService: ProductService = new LocalStorageProductService();
export const categoryService: CategoryService = new LocalStorageCategoryService();
export const orderService: OrderService = new LocalStorageOrderService();
export const authService: AuthService = new LocalStorageAuthService();

export type { ProductService, CategoryService, OrderService, AuthService };
