import type { Category } from '../types';

let _idCounter = 0;
export function uid(): string {
  _idCounter++;
  return `${Date.now()}-${_idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

export const defaultCategories: Category[] = [
  { id: 'cat-frame', name: { zh: '车架/车斗', en: 'Frame/Bucket', ru: 'Рама/Кузов' }, icon: '🔧', sortOrder: 0 },
  { id: 'cat-wheels', name: { zh: '车轮/轮胎', en: 'Wheels/Tires', ru: 'Колеса/Шины' }, icon: '🛞', sortOrder: 1 },
  { id: 'cat-brake', name: { zh: '刹车系统', en: 'Brake System', ru: 'Тормоза' }, icon: '🛑', sortOrder: 2 },
  { id: 'cat-drivetrain', name: { zh: '传动系统', en: 'Drivetrain', ru: 'Трансмиссия' }, icon: '⛓️', sortOrder: 3 },
  { id: 'cat-seat', name: { zh: '座椅/靠背', en: 'Seat/Backrest', ru: 'Сиденья' }, icon: '🪑', sortOrder: 4 },
  { id: 'cat-lights', name: { zh: '灯具/电气', en: 'Lights/Electrical', ru: 'Фары' }, icon: '💡', sortOrder: 5 },
  { id: 'cat-bearings', name: { zh: '轴承/轴套', en: 'Bearings/Bushings', ru: 'Подшипники' }, icon: '⚙️', sortOrder: 6 },
  { id: 'cat-screws', name: { zh: '螺丝/紧固件', en: 'Screws/Fasteners', ru: 'Крепеж' }, icon: '🔩', sortOrder: 7 },
  { id: 'cat-suspension', name: { zh: '减震/悬挂', en: 'Shock/Suspension', ru: 'Амортизаторы' }, icon: '🔧', sortOrder: 8 },
  { id: 'cat-other', name: { zh: '其他配件', en: 'Other Parts', ru: 'Прочее' }, icon: '📦', sortOrder: 9 },
];

export const defaultCompany = {
  name: { zh: '三轮车配件公司', en: 'Tricycle Parts Co.', ru: 'ООО Трицикл' },
  phone: '+86 138-0000-0000',
  wechatQR: '',
  address: { zh: '', en: '', ru: '' },
};
