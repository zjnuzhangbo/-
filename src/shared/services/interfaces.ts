import type { Product, Category, Order } from '../types';

export interface ProductService {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | undefined>;
  create(product: Product): Promise<void>;
  update(id: string, data: Partial<Product>): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface CategoryService {
  getAll(): Promise<Category[]>;
  create(category: Category): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface OrderService {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | undefined>;
  create(order: Order): Promise<void>;
  update(id: string, data: Partial<Order>): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface AuthService {
  login(username: string, password: string): Promise<boolean>;
  logout(): void;
  isLoggedIn(): boolean;
  getToken(): string | null;
}
