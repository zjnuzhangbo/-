import { supabase } from './supabase';

function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(parts[1]);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new Blob([buffer], { type: mime });
}

async function migrateImage(base64: string): Promise<string> {
  const blob = base64ToBlob(base64);
  const ext = base64.startsWith('data:image/png') ? 'png' : 'jpg';
  const filename = `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, blob, { cacheControl: '3600' });

  if (error) throw error;

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename);

  return data.publicUrl;
}

export async function migrateExistingImages(): Promise<void> {
  const raw = localStorage.getItem('tricycle_products');
  if (!raw) return;

  const products = JSON.parse(raw);
  let changed = false;

  for (const product of products) {
    const migrated: string[] = [];
    for (const img of product.images) {
      if (img.startsWith('data:')) {
        try {
          const url = await migrateImage(img);
          migrated.push(url);
          changed = true;
        } catch (e) {
          console.error('Failed to migrate image:', e);
          migrated.push(img);
        }
      } else {
        migrated.push(img);
      }
    }
    product.images = migrated;

    if (product.variants) {
      for (const variant of product.variants) {
        if (variant.image && variant.image.startsWith('data:')) {
          try {
            variant.image = await migrateImage(variant.image);
            changed = true;
          } catch (e) {
            console.error('Failed to migrate variant image:', e);
          }
        }
      }
    }
  }

  if (changed) {
    for (const product of products) {
      const { error } = await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        description: product.description,
        category_id: product.categoryId,
        images: product.images,
        variants: product.variants,
      });
      if (error) {
        console.error('Failed to upsert migrated product:', error);
      }
    }
  }
}
