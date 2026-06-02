import { supabase } from './client';
import type { ProductService } from '../interfaces';
import type { Product } from '../../types';

export class SupabaseProductService implements ProductService {
  async getAll(): Promise<Product[]> {
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (prodError) { console.error('products.getAll:', prodError); return []; }

    const { data: variants, error: varError } = await supabase
      .from('variants')
      .select('*')
      .order('id');
    if (varError) { console.error('variants.getAll:', varError); return []; }

    const variantMap = new Map<string, unknown[]>();
    for (const v of (variants || [])) {
      const pid = v.product_id as string;
      if (!variantMap.has(pid)) variantMap.set(pid, []);
      variantMap.get(pid)!.push(v);
    }

    return (products || []).map(p => rowToProduct(p, variantMap.get(p.id as string) || []));
  }

  async getById(id: string): Promise<Product | undefined> {
    const { data: product, error } = await supabase
      .from('products').select('*').eq('id', id).single();
    if (error || !product) return undefined;

    const { data: variants } = await supabase
      .from('variants').select('*').eq('product_id', id).order('id');
    return rowToProduct(product, variants || []);
  }

  async create(product: Product): Promise<void> {
    const { error } = await supabase.from('products').insert({
      id: product.id,
      name_zh: product.name.zh,
      name_en: product.name.en,
      name_ru: product.name.ru,
      category_id: product.categoryId,
      images: product.images,
      active: product.active,
      created_at: product.createdAt,
    });
    if (error) throw error;

    if (product.variants.length > 0) {
      const variantRows = product.variants.map(v => ({
        id: v.id,
        product_id: product.id,
        model: v.model,
        size: v.size,
        weight: v.weight,
      }));
      const { error: vError } = await supabase.from('variants').insert(variantRows);
      if (vError) throw vError;
    }
  }

  async update(id: string, data: Partial<Product>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.name) {
      updates.name_zh = data.name.zh;
      updates.name_en = data.name.en;
      updates.name_ru = data.name.ru;
    }
    if (data.categoryId !== undefined) updates.category_id = data.categoryId;
    if (data.images !== undefined) updates.images = data.images;
    if (data.active !== undefined) updates.active = data.active;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('products').update(updates).eq('id', id);
      if (error) throw error;
    }

    if (data.variants !== undefined) {
      await supabase.from('variants').delete().eq('product_id', id);
      if (data.variants.length > 0) {
        const variantRows = data.variants.map(v => ({
          id: v.id || crypto.randomUUID(),
          product_id: id,
          model: v.model,
          size: v.size,
          weight: v.weight,
        }));
        const { error: vError } = await supabase.from('variants').insert(variantRows);
        if (vError) throw vError;
      }
    }
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }
}

function rowToProduct(row: Record<string, unknown>, variants: unknown[]): Product {
  return {
    id: row.id as string,
    name: {
      zh: (row.name_zh as string) || '',
      en: (row.name_en as string) || '',
      ru: (row.name_ru as string) || '',
    },
    description: { zh: '', en: '', ru: '' },
    categoryId: (row.category_id as string) || '',
    images: (row.images as string[]) || [],
    variants: variants.map(v => {
      const rv = v as Record<string, unknown>;
      return {
        id: rv.id as string,
        model: (rv.model as string) || '',
        size: (rv.size as string) || '',
        weight: (rv.weight as string) || '',
      };
    }),
    active: (row.active as boolean) ?? true,
    createdAt: (row.created_at as string) || '',
  };
}
