import { supabase } from './client';
import type { OrderService } from '../interfaces';
import type { Order } from '../../types';

export class SupabaseOrderService implements OrderService {
  async getAll(): Promise<Order[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('orders.getAll:', error); return []; }

    if (!orders || orders.length === 0) return [];

    const orderIds = orders.map(o => o.id);
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds)
      .order('id');

    const itemMap = new Map<string, unknown[]>();
    for (const item of (items || [])) {
      const oid = (item as Record<string, unknown>).order_id as string;
      if (!itemMap.has(oid)) itemMap.set(oid, []);
      itemMap.get(oid)!.push(item);
    }

    return orders.map(o => rowToOrder(o, itemMap.get(o.id as string) || []));
  }

  async getById(id: string): Promise<Order | undefined> {
    const { data: order, error } = await supabase
      .from('orders').select('*').eq('id', id).single();
    if (error || !order) return undefined;

    const { data: items } = await supabase
      .from('order_items').select('*').eq('order_id', id).order('id');
    return rowToOrder(order, items || []);
  }

  async create(order: Order): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('orders').insert({
      id: order.id,
      order_number: order.orderNumber,
      customer_id: user?.id,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_address: order.customerAddress,
      status: order.status,
      created_at: order.createdAt,
    });
    if (error) throw error;

    if (order.items.length > 0) {
      const itemRows = order.items.map(item => ({
        id: crypto.randomUUID(),
        order_id: order.id,
        product_name: item.productName,
        model: item.model,
        spec: item.spec,
        quantity: item.quantity,
        unit_price: item.unitPrice ?? null,
        image_url: item.imageUrl || null,
      }));
      const { error: iError } = await supabase.from('order_items').insert(itemRows);
      if (iError) throw iError;
    }
  }

  async update(id: string, data: Partial<Order>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.status !== undefined) updates.status = data.status;
    if (data.customerName !== undefined) updates.customer_name = data.customerName;
    if (data.customerPhone !== undefined) updates.customer_phone = data.customerPhone;
    if (data.customerAddress !== undefined) updates.customer_address = data.customerAddress;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('orders').update(updates).eq('id', id);
      if (error) throw error;
    }

    if (data.items !== undefined) {
      await supabase.from('order_items').delete().eq('order_id', id);
      if (data.items.length > 0) {
        const itemRows = data.items.map(item => ({
          id: crypto.randomUUID(),
          order_id: id,
          product_name: item.productName,
          model: item.model,
          spec: item.spec,
          quantity: item.quantity,
          unit_price: item.unitPrice ?? null,
          image_url: item.imageUrl || null,
        }));
        const { error: iError } = await supabase.from('order_items').insert(itemRows);
        if (iError) throw iError;
      }
    }
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  }
}

function rowToOrder(row: Record<string, unknown>, items: unknown[]): Order {
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
      return {
        id: ri.id as string,
        productId: '',
        variantId: '',
        productName: (ri.product_name as string) || '',
        model: (ri.model as string) || '',
        spec: (ri.spec as string) || '',
        quantity: (ri.quantity as number) || 1,
        unitPrice: ri.unit_price as number | undefined,
        imageUrl: ri.image_url as string | undefined,
      };
    }),
  };
}
