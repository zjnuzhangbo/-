import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  try {
    const { action, orderId, items, id } = await req.json();

    switch (action) {
      case 'list': {
        const { data: orders, error } = await supabase
          .from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        if (!orders || orders.length === 0) {
          return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        const orderIds = orders.map(o => o.id);
        const { data: orderItems } = await supabase
          .from('order_items').select('*').in('order_id', orderIds).order('id');
        const itemMap = new Map();
        for (const item of (orderItems || [])) {
          if (!itemMap.has(item.order_id)) itemMap.set(item.order_id, []);
          itemMap.get(item.order_id).push(item);
        }
        const result = orders.map(o => ({ ...o, items: itemMap.get(o.id) || [] }));
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'updatePricing': {
        for (const item of items) {
          await supabase.from('order_items').update({ unit_price: item.unitPrice }).eq('id', item.id);
        }
        const { data: allItems } = await supabase
          .from('order_items').select('unit_price').eq('order_id', orderId);
        const allPriced = (allItems || []).every(i => i.unit_price !== null);
        await supabase.from('orders').update({ status: allPriced ? 'priced' : 'pending' }).eq('id', orderId);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'delete': {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'unknown action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
