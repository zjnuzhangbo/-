import { create } from 'zustand';
import type { Product } from '../types';

interface ProductState {
  products: Product[];
  load: () => void;
  add: (p: Product) => void;
  update: (id: string, data: Partial<Product>) => void;
  remove: (id: string) => void;
  getById: (id: string) => Product | undefined;
}

const KEY = 'tricycle_products';

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  load: () => {
    const raw = localStorage.getItem(KEY);
    if (raw) set({ products: JSON.parse(raw) });
  },
  add: (p) => {
    const next = [...get().products, p];
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ products: next });
  },
  update: (id, data) => {
    const next = get().products.map((p) => (p.id === id ? { ...p, ...data } : p));
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ products: next });
  },
  remove: (id) => {
    const next = get().products.filter((p) => p.id !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ products: next });
  },
  getById: (id) => get().products.find((p) => p.id === id),
}));
