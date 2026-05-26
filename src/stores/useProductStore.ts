import { create } from 'zustand';
import type { Product } from '../types';

const STORAGE_KEY = 'tricycle_products';

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

interface ProductState {
  products: Product[];
  load: () => void;
  add: (p: Product) => void;
  update: (id: string, data: Partial<Product>) => void;
  remove: (id: string) => void;
  getById: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  load: () => {
    set({ products: loadProducts() });
  },

  add: (p) => {
    const next = [p, ...get().products];
    saveProducts(next);
    set({ products: next });
  },

  update: (id, data) => {
    const next = get().products.map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    saveProducts(next);
    set({ products: next });
  },

  remove: (id) => {
    const next = get().products.filter((p) => p.id !== id);
    saveProducts(next);
    set({ products: next });
  },

  getById: (id) => get().products.find((p) => p.id === id),
}));
