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
  image?: string;
}

export interface Product {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  categoryId: string;
  images: string[];
  variants: Variant[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: LocalizedString;
  icon: string;
  sortOrder: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface InvoiceItem {
  productId: string;
  variantId: string;
  productName: string;
  model: string;
  spec: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  items: InvoiceItem[];
  totalAmount: number;
  createdAt: string;
  exportedAs?: 'excel' | 'word';
}

export interface Company {
  name: LocalizedString;
  phone: string;
  wechatQR: string;
  address?: LocalizedString;
}

export type Language = 'zh' | 'en' | 'ru';
