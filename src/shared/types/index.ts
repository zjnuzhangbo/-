export interface LocalizedString {
  zh: string;
  en: string;
  ru: string;
}

export interface Variant {
  id: string;
  model: string;
  size: string;
  weight: string;
}

export interface Product {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  categoryId: string;
  images: string[];
  variants: Variant[];
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: LocalizedString;
  icon: string;
  sortOrder: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  variantId: string;
  productName: string;
  model: string;
  spec: string;
  quantity: number;
  unitPrice?: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  status: 'pending' | 'priced';
  createdAt: string;
}

export type OrderStatus = Order['status'];
