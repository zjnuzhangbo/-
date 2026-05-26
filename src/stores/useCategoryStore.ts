import { create } from 'zustand';
import type { Category } from '../types';
import { defaultCategories } from '../utils/seedData';

const STORAGE_KEY = 'tricycle_categories';

function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultCategories;
}

function saveCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

interface CategoryState {
  categories: Category[];
  load: () => void;
  add: (c: Category) => void;
  update: (id: string, data: Partial<Category>) => void;
  remove: (id: string) => void;
  reorder: (ids: string[]) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],

  load: () => {
    set({ categories: loadCategories() });
  },

  add: (c) => {
    const next = [...get().categories, c];
    saveCategories(next);
    set({ categories: next });
  },

  update: (id, data) => {
    const next = get().categories.map((c) =>
      c.id === id ? { ...c, ...data } : c
    );
    saveCategories(next);
    set({ categories: next });
  },

  remove: (id) => {
    const next = get().categories.filter((c) => c.id !== id);
    saveCategories(next);
    set({ categories: next });
  },

  reorder: (ids) => {
    const next = ids.map((id, i) => {
      const c = get().categories.find((x) => x.id === id)!;
      return { ...c, sortOrder: i };
    });
    saveCategories(next);
    set({ categories: next });
  },
}));
