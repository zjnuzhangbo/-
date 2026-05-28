import { productService, categoryService } from './index';
import type { Category, Product } from '../types';

const categories: Category[] = [
  { id: 'cat-1', name: { zh: '车架/车斗', en: 'Frame/Body', ru: 'Рама/Кузов' }, icon: '🔩', sortOrder: 1 },
  { id: 'cat-2', name: { zh: '车轮/轮胎', en: 'Wheels/Tires', ru: 'Колеса/Шины' }, icon: '🛞', sortOrder: 2 },
  { id: 'cat-3', name: { zh: '刹车系统', en: 'Brake System', ru: 'Тормозная система' }, icon: '🛑', sortOrder: 3 },
  { id: 'cat-4', name: { zh: '传动系统', en: 'Drivetrain', ru: 'Трансмиссия' }, icon: '⚙️', sortOrder: 4 },
  { id: 'cat-5', name: { zh: '电气系统', en: 'Electrical', ru: 'Электрика' }, icon: '🔌', sortOrder: 5 },
];

const products: Product[] = [
  {
    id: 'prod-1', name: { zh: '前叉总成', en: 'Front Fork Assembly', ru: 'Вилка в сборе' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-1', images: [], variants: [{ id: 'v1', model: '标准型', size: '32mm', weight: '2.4kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2', name: { zh: '后轮毂总成', en: 'Rear Hub Assembly', ru: 'Задняя ступица' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-2', images: [], variants: [{ id: 'v2', model: '标准型', size: '16寸', weight: '3.1kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3', name: { zh: '刹车蹄总成', en: 'Brake Shoe Assembly', ru: 'Тормозные колодки' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-3', images: [], variants: [{ id: 'v3', model: '标准型', size: '130mm', weight: '0.8kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4', name: { zh: '差速器总成', en: 'Differential Assembly', ru: 'Дифференциал' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-4', images: [], variants: [{ id: 'v4', model: '18齿', size: '标准', weight: '4.2kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5', name: { zh: 'LED大灯总成', en: 'LED Headlight', ru: 'Светодиодная фара' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-5', images: [], variants: [{ id: 'v5', model: '12V', size: '7寸', weight: '0.6kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6', name: { zh: '车架主梁', en: 'Main Frame Beam', ru: 'Главная балка рамы' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-1', images: [], variants: [{ id: 'v6', model: '加厚型', size: '2.5m', weight: '15.0kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7', name: { zh: '轮胎内胎', en: 'Inner Tube', ru: 'Камера' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-2', images: [], variants: [{ id: 'v7', model: '标准型', size: '3.00-12', weight: '0.5kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-8', name: { zh: '离合器片', en: 'Clutch Plate', ru: 'Диск сцепления' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-4', images: [], variants: [{ id: 'v8', model: '标准型', size: '150mm', weight: '1.2kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
];

export async function seedIfEmpty() {
  const cats = await categoryService.getAll();
  if (cats.length === 0) {
    for (const c of categories) { await categoryService.create(c); }
  }
  const prods = await productService.getAll();
  if (prods.length === 0) {
    for (const p of products) { await productService.create(p); }
  }
}
