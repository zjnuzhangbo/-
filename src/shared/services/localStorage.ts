import type { Product, Category, Order } from '../types';
import type { ProductService, CategoryService, OrderService, AuthService } from './interfaces';

const PRODUCTS_KEY = 'tricycle_products';
const CATEGORIES_KEY = 'tricycle_categories';
const ORDERS_KEY = 'tricycle_orders';
const AUTH_KEY = 'tricycle_auth';
const SHIPPING_KEY = 'tricycle_shipping';

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export class LocalStorageProductService implements ProductService {
  async getAll(): Promise<Product[]> { return read<Product>(PRODUCTS_KEY); }
  async getById(id: string): Promise<Product | undefined> {
    return read<Product>(PRODUCTS_KEY).find(p => p.id === id);
  }
  async create(product: Product): Promise<void> {
    const list = read<Product>(PRODUCTS_KEY);
    list.push(product);
    write(PRODUCTS_KEY, list);
  }
  async update(id: string, data: Partial<Product>): Promise<void> {
    const list = read<Product>(PRODUCTS_KEY);
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data }; write(PRODUCTS_KEY, list); }
  }
  async remove(id: string): Promise<void> {
    write(PRODUCTS_KEY, read<Product>(PRODUCTS_KEY).filter(p => p.id !== id));
  }
}

export class LocalStorageCategoryService implements CategoryService {
  async getAll(): Promise<Category[]> { return read<Category>(CATEGORIES_KEY); }
  async create(category: Category): Promise<void> {
    const list = read<Category>(CATEGORIES_KEY);
    list.push(category);
    write(CATEGORIES_KEY, list);
  }
  async remove(id: string): Promise<void> {
    write(CATEGORIES_KEY, read<Category>(CATEGORIES_KEY).filter(c => c.id !== id));
  }
}

export class LocalStorageOrderService implements OrderService {
  async getAll(): Promise<Order[]> { return read<Order>(ORDERS_KEY); }
  async getById(id: string): Promise<Order | undefined> {
    return read<Order>(ORDERS_KEY).find(o => o.id === id);
  }
  async create(order: Order): Promise<void> {
    const list = read<Order>(ORDERS_KEY);
    list.push(order);
    write(ORDERS_KEY, list);
  }
  async update(id: string, data: Partial<Order>): Promise<void> {
    const list = read<Order>(ORDERS_KEY);
    const idx = list.findIndex(o => o.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data }; write(ORDERS_KEY, list); }
  }
  async remove(id: string): Promise<void> {
    write(ORDERS_KEY, read<Order>(ORDERS_KEY).filter(o => o.id !== id));
  }
}

export class LocalStorageAuthService implements AuthService {
  async login(username: string, password: string): Promise<boolean> {
    if (username === 'admin' && password === '123456') {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token: 'admin_token', loggedAt: Date.now() }));
      return true;
    }
    return false;
  }
  logout(): void { localStorage.removeItem(AUTH_KEY); }
  isLoggedIn(): boolean { return localStorage.getItem(AUTH_KEY) !== null; }
  getToken(): string | null {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw).token : null;
  }
}

export const SHIPPING_MEMORY_KEY = SHIPPING_KEY;
export function getShippingMemory(): { name: string; phone: string; address: string } | null {
  try {
    const raw = localStorage.getItem(SHIPPING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function setShippingMemory(data: { name: string; phone: string; address: string }): void {
  localStorage.setItem(SHIPPING_KEY, JSON.stringify(data));
}
