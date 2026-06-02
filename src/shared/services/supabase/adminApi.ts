const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

function getAdminToken(): string | null {
  try {
    const raw = sessionStorage.getItem('tricycle_admin_token');
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  sessionStorage.setItem('tricycle_admin_token', JSON.stringify({ token }));
}

export function clearAdminToken() {
  sessionStorage.removeItem('tricycle_admin_token');
}

export function hasAdminToken(): boolean {
  return getAdminToken() !== null;
}

async function adminFetch(path: string, body: unknown): Promise<{ data?: unknown; error?: string }> {
  const token = getAdminToken();
  const res = await fetch(`${FUNCTIONS_BASE}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || `HTTP ${res.status}` };
  return { data: json };
}

export async function adminLogin(password: string): Promise<{ token?: string; error?: string }> {
  const { data, error } = await adminFetch('admin-login', { password });
  if (error) return { error };
  const token = (data as { token: string }).token;
  if (token) setAdminToken(token);
  return { token };
}

export async function adminListProducts(): Promise<{ data?: unknown[]; error?: string }> {
  return adminFetch('admin-products', { action: 'list' }) as Promise<{ data?: unknown[]; error?: string }>;
}

export async function adminCreateProduct(product: Record<string, unknown>): Promise<{ data?: unknown; error?: string }> {
  return adminFetch('admin-products', { action: 'create', product });
}

export async function adminUpdateProduct(id: string, updates: Record<string, unknown>): Promise<{ data?: unknown; error?: string }> {
  return adminFetch('admin-products', { action: 'update', id, updates });
}

export async function adminDeleteProduct(id: string): Promise<{ error?: string }> {
  return adminFetch('admin-products', { action: 'delete', id });
}

export async function adminListCategories(): Promise<{ data?: unknown[]; error?: string }> {
  return adminFetch('admin-categories', { action: 'list' }) as Promise<{ data?: unknown[]; error?: string }>;
}

export async function adminCreateCategory(category: Record<string, unknown>): Promise<{ data?: unknown; error?: string }> {
  return adminFetch('admin-categories', { action: 'create', category });
}

export async function adminDeleteCategory(id: string): Promise<{ error?: string }> {
  return adminFetch('admin-categories', { action: 'delete', id });
}

export async function adminListOrders(): Promise<{ data?: unknown[]; error?: string }> {
  return adminFetch('admin-orders', { action: 'list' }) as Promise<{ data?: unknown[]; error?: string }>;
}

export async function adminUpdatePricing(orderId: string, items: { id: string; unitPrice: number }[]): Promise<{ data?: unknown; error?: string }> {
  return adminFetch('admin-orders', { action: 'updatePricing', orderId, items });
}

export async function adminDeleteOrder(id: string): Promise<{ error?: string }> {
  return adminFetch('admin-orders', { action: 'delete', id });
}

export async function adminUploadImage(base64: string): Promise<{ url?: string; error?: string }> {
  return adminFetch('admin-products', { action: 'uploadImage', base64 }) as Promise<{ url?: string; error?: string }>;
}
