import { supabase } from './client';
import type { CategoryService } from '../interfaces';
import type { Category } from '../../types';

export class SupabaseCategoryService implements CategoryService {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    if (error) { console.error('categories.getAll:', error); return []; }
    return (data || []).map(rowToCategory);
  }

  async create(category: Category): Promise<void> {
    const { error } = await supabase.from('categories').insert({
      id: category.id,
      name_zh: category.name.zh,
      name_en: category.name.en,
      name_ru: category.name.ru,
      icon: category.icon,
      sort_order: category.sortOrder,
    });
    if (error) throw error;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
}

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: {
      zh: (row.name_zh as string) || '',
      en: (row.name_en as string) || '',
      ru: (row.name_ru as string) || '',
    },
    icon: (row.icon as string) || '',
    sortOrder: (row.sort_order as number) || 0,
  };
}
