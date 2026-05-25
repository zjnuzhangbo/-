import { create } from 'zustand';
import type { Product } from '../types';
import { supabase } from '../lib/supabase';

interface ProductState {
  products: Product[];
  load: () => void;
  add: (p: Product) => void;
  update: (id: string, data: Partial<Product>) => void;
  remove: (id: string) => void;
  getById: (id: string) => Product | undefined;
}

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as Product['name'],
    description: row.description as Product['description'],
    categoryId: row.category_id as string,
    images: (row.images || []) as string[],
    variants: (row.variants || []) as Product['variants'],
    createdAt: row.created_at as string,
  };
}

function productToRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category_id: p.categoryId,
    images: p.images,
    variants: p.variants,
  };
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  load: () => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        set({ products: data.map(rowToProduct) });
      } else {
        console.error('Failed to load products:', error);
      }
    })();
  },

  add: (p) => {
    set({ products: [p, ...get().products] });
    supabase.from('products').insert(productToRow(p)).then(({ error }) => {
      if (error) {
        console.error('Failed to add product:', error);
        set({ products: get().products.filter((x) => x.id !== p.id) });
      }
    });
  },

  update: (id, data) => {
    const next = get().products.map((p) => (p.id === id ? { ...p, ...data } : p));
    set({ products: next });

    const row: Record<string, unknown> = {};
    if (data.name) row.name = data.name;
    if (data.description) row.description = data.description;
    if (data.categoryId) row.category_id = data.categoryId;
    if (data.images) row.images = data.images;
    if (data.variants) row.variants = data.variants;

    supabase.from('products').update(row).eq('id', id).then(({ error }) => {
      if (error) {
        console.error('Failed to update product:', error);
        get().load();
      }
    });
  },

  remove: (id) => {
    set({ products: get().products.filter((p) => p.id !== id) });
    supabase.from('products').delete().eq('id', id).then(({ error }) => {
      if (error) {
        console.error('Failed to delete product:', error);
        get().load();
      }
    });
  },

  getById: (id) => get().products.find((p) => p.id === id),
}));
