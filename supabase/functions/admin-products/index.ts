import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
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
    const { action, product, id, updates, base64 } = await req.json();

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('products').select('*').order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        const { data: variants } = await supabase.from('variants').select('*');
        const varMap = new Map();
        for (const v of (variants || [])) {
          if (!varMap.has(v.product_id)) varMap.set(v.product_id, []);
          varMap.get(v.product_id).push(v);
        }
        const result = (data || []).map(p => ({
          ...p,
          variants: varMap.get(p.id) || [],
        }));
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'create': {
        const { variants: vArr, ...prod } = product;
        const dbProduct = { ...prod };
        if (prod.name) {
          dbProduct.name_zh = prod.name.zh;
          dbProduct.name_en = prod.name.en;
          dbProduct.name_ru = prod.name.ru;
          delete dbProduct.name;
        }
        const { error } = await supabase.from('products').insert(dbProduct);
        if (error) throw new Error(error.message);
        if (vArr && vArr.length > 0) {
          const vRows = vArr.map((v: Record<string, unknown>) => ({ ...v, product_id: prod.id }));
          await supabase.from('variants').insert(vRows);
        }
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'update': {
        const { variants: vArr, ...prod } = updates;
        const dbUpdates = { ...prod };
        if (prod.name) {
          dbUpdates.name_zh = prod.name.zh;
          dbUpdates.name_en = prod.name.en;
          dbUpdates.name_ru = prod.name.ru;
          delete dbUpdates.name;
        }
        if (Object.keys(dbUpdates).length > 0) {
          const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
          if (error) throw new Error(error.message);
        }
        if (vArr !== undefined) {
          await supabase.from('variants').delete().eq('product_id', id);
          if (vArr.length > 0) {
            const vRows = vArr.map((v: Record<string, unknown>) => ({ ...v, product_id: id }));
            await supabase.from('variants').insert(vRows);
          }
        }
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'delete': {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'uploadImage': {
        const buf = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const filename = crypto.randomUUID() + '.png';
        const { error } = await supabase.storage
          .from('product-images').upload(filename, buf, { contentType: 'image/png', upsert: false });
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
        return new Response(JSON.stringify({ url: data.publicUrl }), {
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
