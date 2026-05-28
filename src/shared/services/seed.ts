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
    categoryId: 'cat-1', images: [],
    variants: [
      { id: 'v1a', model: '标准型', size: '32mm', weight: '2.4kg' },
      { id: 'v1b', model: '加粗型', size: '36mm', weight: '2.8kg' },
      { id: 'v1c', model: '轻量型', size: '28mm', weight: '1.9kg' },
    ],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2', name: { zh: '后轮毂总成', en: 'Rear Hub Assembly', ru: 'Задняя ступица' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-2', images: [],
    variants: [
      { id: 'v2a', model: '标准型', size: '16寸', weight: '3.1kg' },
      { id: 'v2b', model: '重型', size: '18寸', weight: '4.0kg' },
    ],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3', name: { zh: '刹车蹄总成', en: 'Brake Shoe Assembly', ru: 'Тормозные колодки' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-3', images: [],
    variants: [
      { id: 'v3a', model: '标准型', size: '130mm', weight: '0.8kg' },
      { id: 'v3b', model: '高性能', size: '150mm', weight: '1.0kg' },
    ],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4', name: { zh: '差速器总成', en: 'Differential Assembly', ru: 'Дифференциал' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-4', images: [],
    variants: [
      { id: 'v4a', model: '18齿', size: '标准', weight: '4.2kg' },
      { id: 'v4b', model: '20齿', size: '标准', weight: '4.5kg' },
      { id: 'v4c', model: '16齿', size: '小型', weight: '3.6kg' },
    ],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5', name: { zh: 'LED大灯总成', en: 'LED Headlight', ru: 'Светодиодная фара' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-5', images: [],
    variants: [
      { id: 'v5a', model: '12V', size: '7寸', weight: '0.6kg' },
      { id: 'v5b', model: '24V', size: '9寸', weight: '0.9kg' },
    ],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6', name: { zh: '车架主梁', en: 'Main Frame Beam', ru: 'Главная балка рамы' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-1', images: [],
    variants: [
      { id: 'v6a', model: '加厚型', size: '2.5m', weight: '15.0kg' },
      { id: 'v6b', model: '标准型', size: '2.5m', weight: '12.0kg' },
    ],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7', name: { zh: '轮胎内胎', en: 'Inner Tube', ru: 'Камера' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-2', images: [],
    variants: [
      { id: 'v7a', model: '标准型', size: '3.00-12', weight: '0.5kg' },
      { id: 'v7b', model: '标准型', size: '3.50-12', weight: '0.6kg' },
      { id: 'v7c', model: '标准型', size: '4.00-12', weight: '0.7kg' },
    ],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-8', name: { zh: '离合器片', en: 'Clutch Plate', ru: 'Диск сцепления' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-4', images: [],
    variants: [
      { id: 'v8a', model: '标准型', size: '150mm', weight: '1.2kg' },
      { id: 'v8b', model: '加强型', size: '160mm', weight: '1.5kg' },
    ],
    active: true, createdAt: new Date().toISOString(),
  },
];

const SEED_VERSION_KEY = 'tricycle_seed_version';
const CURRENT_SEED_VERSION = 2;

export async function seedIfEmpty() {
  const seedVersion = localStorage.getItem(SEED_VERSION_KEY);
  const needsReseed = seedVersion !== String(CURRENT_SEED_VERSION);

  if (needsReseed) {
    // Clear old data and re-seed
    const existingProds = await productService.getAll();
    for (const p of existingProds) { await productService.remove(p.id); }
    const existingCats = await categoryService.getAll();
    for (const c of existingCats) { await categoryService.remove(c.id); }
  }

  const cats = await categoryService.getAll();
  if (cats.length === 0) {
    for (const c of categories) { await categoryService.create(c); }
  }
  const prods = await productService.getAll();
  if (prods.length === 0) {
    for (const p of products) { await productService.create(p); }
  }

  if (needsReseed) {
    localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION));
  }
}
