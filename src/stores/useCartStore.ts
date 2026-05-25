import { create } from 'zustand';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  load: () => void;
  addItem: (productId: string, variantId: string) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQty: (productId: string, variantId: string, qty: number) => void;
  clearCart: () => void;
  totalCount: () => number;
}

const KEY = 'tricycle_cart';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  load: () => {
    const raw = localStorage.getItem(KEY);
    if (raw) set({ items: JSON.parse(raw) });
  },
  addItem: (productId, variantId) => {
    const existing = get().items.find((i) => i.productId === productId && i.variantId === variantId);
    let next: CartItem[];
    if (existing) {
      next = get().items.map((i) =>
        i.productId === productId && i.variantId === variantId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      next = [...get().items, { productId, variantId, quantity: 1 }];
    }
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ items: next });
  },
  removeItem: (productId, variantId) => {
    const next = get().items.filter((i) => !(i.productId === productId && i.variantId === variantId));
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ items: next });
  },
  updateQty: (productId, variantId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId, variantId);
      return;
    }
    const next = get().items.map((i) =>
      i.productId === productId && i.variantId === variantId ? { ...i, quantity: qty } : i
    );
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ items: next });
  },
  clearCart: () => {
    localStorage.removeItem(KEY);
    set({ items: [] });
  },
  totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
