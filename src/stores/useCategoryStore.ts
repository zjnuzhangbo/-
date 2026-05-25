import { create } from 'zustand';
import type { Category } from '../types';
import { supabase } from '../lib/supabase';
import { defaultCategories } from '../utils/seedData';

interface CategoryState {
  categories: Category[];
  load: () => void;
  add: (c: Category) => void;
  update: (id: string, data: Partial<Category>) => void;
  remove: (id: string) => void;
  reorder: (ids: string[]) => void;
}

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as Category['name'],
    icon: row.icon as string,
    sortOrder: row.sort_order as number,
  };
}

function categoryToRow(c: Category) {
  return {
    id: c.id,
    name: c.name,
    icon: c.icon,
    sort_order: c.sortOrder,
  };
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],

  load: () => {
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        set({ categories: data.map(rowToCategory) });
      } else if (!error && data && data.length === 0) {
        const rows = defaultCategories.map(categoryToRow);
        const { error: seedError } = await supabase.from('categories').insert(rows);
        if (!seedError) {
          set({ categories: defaultCategories });
        }
      } else {
        console.error('Failed to load categories:', error);
        set({ categories: defaultCategories });
      }
    })();
  },

  add: (c) => {
    set({ categories: [...get().categories, c] });
    supabase.from('categories').insert(categoryToRow(c)).then(({ error }) => {
      if (error) console.error('Failed to add category:', error);
    });
  },

  update: (id, data) => {
    const next = get().categories.map((c) => (c.id === id ? { ...c, ...data } : c));
    set({ categories: next });

    const row: Record<string, unknown> = {};
    if (data.name) row.name = data.name;
    if (data.icon !== undefined) row.icon = data.icon;
    if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;

    supabase.from('categories').update(row).eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to update category:', error);
    });
  },

  remove: (id) => {
    set({ categories: get().categories.filter((c) => c.id !== id) });
    supabase.from('categories').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Failed to delete category:', error);
    });
  },

  reorder: (ids) => {
    const next = ids.map((id, i) => {
      const c = get().categories.find((x) => x.id === id)!;
      return { ...c, sortOrder: i };
    });
    set({ categories: next });

    ids.forEach((id, i) => {
      supabase.from('categories').update({ sort_order: i }).eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to reorder category:', error);
      });
    });
  },
}));
