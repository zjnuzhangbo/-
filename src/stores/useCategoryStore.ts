import { create } from 'zustand';
import type { Category } from '../types';
import { defaultCategories } from '../utils/seedData';

interface CategoryState {
  categories: Category[];
  load: () => void;
  add: (c: Category) => void;
  update: (id: string, data: Partial<Category>) => void;
  remove: (id: string) => void;
  reorder: (ids: string[]) => void;
}

const KEY = 'tricycle_categories';

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  load: () => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      set({ categories: JSON.parse(raw) });
    } else {
      localStorage.setItem(KEY, JSON.stringify(defaultCategories));
      set({ categories: defaultCategories });
    }
  },
  add: (c) => {
    const next = [...get().categories, c];
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ categories: next });
  },
  update: (id, data) => {
    const next = get().categories.map((c) => (c.id === id ? { ...c, ...data } : c));
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ categories: next });
  },
  remove: (id) => {
    const next = get().categories.filter((c) => c.id !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ categories: next });
  },
  reorder: (ids) => {
    const next = ids.map((id, i) => {
      const c = get().categories.find((x) => x.id === id)!;
      return { ...c, sortOrder: i };
    });
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ categories: next });
  },
}));
