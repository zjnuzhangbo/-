import type { Product, Category, Order } from '../../types';
import {
  adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminUploadImage,
  adminListCategories, adminCreateCategory, adminDeleteCategory,
  adminListOrders, adminUpdatePricing, adminDeleteOrder,
} from './adminApi';
import { productService, categoryService, orderService } from '../index';

const useSupabase = !!import.meta.env.VITE_SUPABASE_URL;

function dbToProduct(row: Record<string, unknown>): Product {
  const variants = (row.variants as unknown[]) || [];
  return {
    id: row.id as string,
    name: { zh: (row.name_zh as string) || '', en: (row.name_en as string) || '', ru: (row.name_ru as string) || '' },
    description: { zh: '', en: '', ru: '' },
    categoryId: (row.category_id as string) || '',
    images: (row.images as string[]) || [],
    variants: variants.map(v => {
      const rv = v as Record<string, unknown>;
      return { id: rv.id as string, model: (rv.model as string) || '', size: (rv.size as string) || '', weight: (rv.weight as string) || '' };
    }),
    active: (row.active as boolean) ?? true,
    createdAt: (row.created_at as string) || '',
  };
}

function dbToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: { zh: (row.name_zh as string) || '', en: (row.name_en as string) || '', ru: (row.name_ru as string) || '' },
    icon: (row.icon as string) || '',
    sortOrder: (row.sort_order as number) || 0,
  };
}

function dbToOrder(row: Record<string, unknown>): Order {
  const items = (row.items as unknown[]) || [];
  return {
    id: row.id as string,
    orderNumber: (row.order_number as string) || '',
    customerName: (row.customer_name as string) || '',
    customerPhone: (row.customer_phone as string) || '',
    customerAddress: (row.customer_address as string) || '',
    status: (row.status as 'pending' | 'priced') || 'pending',
    createdAt: (row.created_at as string) || '',
    items: items.map(item => {
      const ri = item as Record<string, unknown>;
      return { productId: '', variantId: '', productName: (ri.product_name as string) || '', model: (ri.model as string) || '', spec: (ri.spec as string) || '', quantity: (ri.quantity as number) || 1, unitPrice: ri.unit_price as number | undefined };
    }),
  };
}

export const adminProductService = {
  getAll: async (): Promise<Product[]> => {
    if (useSupabase) {
      const { data } = await adminListProducts();
      return (data || []).map(r => dbToProduct(r as Record<string, unknown>));
    }
    return productService.getAll();
  },
  create: async (product: Product): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminCreateProduct(product as unknown as Record<string, unknown>);
      if (error) throw new Error(error);
      return;
    }
    return productService.create(product);
  },
  update: async (id: string, data: Partial<Product>): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminUpdateProduct(id, data as unknown as Record<string, unknown>);
      if (error) throw new Error(error);
      return;
    }
    return productService.update(id, data);
  },
  remove: async (id: string): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminDeleteProduct(id);
      if (error) throw new Error(error);
      return;
    }
    return productService.remove(id);
  },
};

export const adminCategoryService = {
  getAll: async (): Promise<Category[]> => {
    if (useSupabase) {
      const { data } = await adminListCategories();
      return (data || []).map(r => dbToCategory(r as Record<string, unknown>));
    }
    return categoryService.getAll();
  },
  create: async (category: Category): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminCreateCategory(category as unknown as Record<string, unknown>);
      if (error) throw new Error(error);
      return;
    }
    return categoryService.create(category);
  },
  remove: async (id: string): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminDeleteCategory(id);
      if (error) throw new Error(error);
      return;
    }
    return categoryService.remove(id);
  },
};

export const adminOrderService = {
  getAll: async (): Promise<Order[]> => {
    if (useSupabase) {
      const { data } = await adminListOrders();
      return (data || []).map(r => dbToOrder(r as Record<string, unknown>));
    }
    return orderService.getAll();
  },
  update: async (id: string, data: Partial<Order>): Promise<void> => {
    if (useSupabase && data.items) {
      const items = data.items.map(i => ({
        id: (i as Record<string, unknown>).id as string,
        unitPrice: i.unitPrice || 0,
      }));
      const { error } = await adminUpdatePricing(id, items);
      if (error) throw new Error(error);
      return;
    }
    return orderService.update(id, data);
  },
  remove: async (id: string): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminDeleteOrder(id);
      if (error) throw new Error(error);
      return;
    }
    return orderService.remove(id);
  },
};
