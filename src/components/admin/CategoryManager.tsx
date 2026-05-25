import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategoryStore } from '../../stores/useCategoryStore';
import type { Category } from '../../types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { uid } from '../../utils/seedData';

const translateDict: Record<string, { en: string; ru: string; icon: string }> = {
  '车架': { en: 'Frame', ru: 'Рама', icon: '🔧' },
  '车斗': { en: 'Bucket', ru: 'Кузов', icon: '🛻' },
  '车轮': { en: 'Wheel', ru: 'Колесо', icon: '🛞' },
  '轮胎': { en: 'Tire', ru: 'Шина', icon: '🛞' },
  '刹车': { en: 'Brake', ru: 'Тормоз', icon: '🛑' },
  '制动': { en: 'Brake', ru: 'Тормоз', icon: '🛑' },
  '传动': { en: 'Drivetrain', ru: 'Трансмиссия', icon: '⛓️' },
  '链条': { en: 'Chain', ru: 'Цепь', icon: '⛓️' },
  '座椅': { en: 'Seat', ru: 'Сиденье', icon: '🪑' },
  '靠背': { en: 'Backrest', ru: 'Спинка', icon: '🪑' },
  '灯具': { en: 'Light', ru: 'Фара', icon: '💡' },
  '电气': { en: 'Electrical', ru: 'Электрика', icon: '⚡' },
  '轴承': { en: 'Bearing', ru: 'Подшипник', icon: '⚙️' },
  '轴套': { en: 'Bushing', ru: 'Втулка', icon: '⚙️' },
  '螺丝': { en: 'Screw', ru: 'Винт', icon: '🔩' },
  '紧固': { en: 'Fastener', ru: 'Крепеж', icon: '🔩' },
  '减震': { en: 'Shock', ru: 'Амортизатор', icon: '🔧' },
  '悬挂': { en: 'Suspension', ru: 'Подвеска', icon: '🔧' },
  '弹簧': { en: 'Spring', ru: 'Пружина', icon: '🪝' },
  '挡泥板': { en: 'Fender', ru: 'Крыло', icon: '🛡️' },
  '把手': { en: 'Handlebar', ru: 'Руль', icon: '🔄' },
  '后视镜': { en: 'Mirror', ru: 'Зеркало', icon: '🪞' },
  '电瓶': { en: 'Battery', ru: 'Аккумулятор', icon: '🔋' },
  '喇叭': { en: 'Horn', ru: 'Гудок', icon: '📢' },
  '配件': { en: 'Parts', ru: 'Запчасти', icon: '📦' },
  '脚踏': { en: 'Pedal', ru: 'Педаль', icon: '🦶' },
  '飞轮': { en: 'Flywheel', ru: 'Маховик', icon: '⚙️' },
  '轮毂': { en: 'Hub', ru: 'Ступица', icon: '🛞' },
  '大灯': { en: 'Headlight', ru: 'Фара', icon: '💡' },
  '尾灯': { en: 'Taillight', ru: 'Задний фонарь', icon: '🔴' },
  '转向灯': { en: 'Turn Signal', ru: 'Поворотник', icon: '↔️' },
  '螺栓': { en: 'Bolt', ru: 'Болт', icon: '🔩' },
  '螺母': { en: 'Nut', ru: 'Гайка', icon: '🔩' },
  '垫片': { en: 'Washer', ru: 'Шайба', icon: '🔩' },
  '辐条': { en: 'Spoke', ru: 'Спица', icon: '🛞' },
  '前叉': { en: 'Fork', ru: 'Вилка', icon: '🔧' },
  '车圈': { en: 'Rim', ru: 'Обод', icon: '🛞' },
  '刹车片': { en: 'Brake Pad', ru: 'Тормозная колодка', icon: '🛑' },
  '刹车线': { en: 'Brake Cable', ru: 'Трос тормоза', icon: '🛑' },
  '牙盘': { en: 'Crank', ru: 'Шатун', icon: '⚙️' },
  '中轴': { en: 'Bottom Bracket', ru: 'Каретка', icon: '⚙️' },
  '座垫': { en: 'Saddle', ru: 'Сиденье', icon: '🪑' },
  '变速箱': { en: 'Gearbox', ru: 'Коробка передач', icon: '⚙️' },
  '离合器': { en: 'Clutch', ru: 'Сцепление', icon: '⚙️' },
  '化油器': { en: 'Carburetor', ru: 'Карбюратор', icon: '🔧' },
  '火花塞': { en: 'Spark Plug', ru: 'Свеча', icon: '⚡' },
  '发动机': { en: 'Engine', ru: 'Двигатель', icon: '🏍️' },
  '排气管': { en: 'Exhaust', ru: 'Выхлоп', icon: '💨' },
  '油箱': { en: 'Fuel Tank', ru: 'Бензобак', icon: '⛽' },
  '车把': { en: 'Handlebar', ru: 'Руль', icon: '🔄' },
  '支架': { en: 'Stand', ru: 'Подставка', icon: '🔧' },
  '车筐': { en: 'Basket', ru: 'Корзина', icon: '🧺' },
  '里程表': { en: 'Odometer', ru: 'Одометр', icon: '📟' },
  '牌照架': { en: 'Plate Holder', ru: 'Рамка номера', icon: '📋' },
  '工具箱': { en: 'Toolbox', ru: 'Ящик', icon: '🧰' },
  '货架': { en: 'Rack', ru: 'Стеллаж', icon: '📦' },
  '皮带': { en: 'Belt', ru: 'Ремень', icon: '🔄' },
  '油封': { en: 'Oil Seal', ru: 'Сальник', icon: '🛡️' },
  '滤清器': { en: 'Filter', ru: 'Фильтр', icon: '🔍' },
  '散热器': { en: 'Radiator', ru: 'Радиатор', icon: '❄️' },
  '电机': { en: 'Motor', ru: 'Мотор', icon: '⚡' },
  '控制器': { en: 'Controller', ru: 'Контроллер', icon: '🎛️' },
  '充电器': { en: 'Charger', ru: 'Зарядное', icon: '🔌' },
};

function autoTranslate(zh: string): { en: string; ru: string; icon: string } {
  let en = '';
  let ru = '';
  let icon = '📦';

  for (const [keyword, trans] of Object.entries(translateDict)) {
    if (zh.includes(keyword)) {
      if (!en) en = trans.en;
      if (!ru) ru = trans.ru;
      if (icon === '📦') icon = trans.icon;
    }
  }

  return { en, ru, icon };
}

export default function CategoryManager() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en' | 'ru';
  const { categories, add, update, remove } = useCategoryStore();
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [icon, setIcon] = useState('📦');
  const [autoFilled, setAutoFilled] = useState(false);

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setNameZh(cat.name.zh);
    setNameEn(cat.name.en);
    setNameRu(cat.name.ru);
    setIcon(cat.icon);
    setAutoFilled(false);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setNameZh(''); setNameEn(''); setNameRu('');
    setIcon('📦');
    setAutoFilled(false);
    setFormOpen(true);
  };

  useEffect(() => {
    if (editing || !nameZh.trim()) return;
    const { en, ru, icon: autoIcon } = autoTranslate(nameZh);
    if (en || ru || autoIcon !== '📦') {
      setNameEn(en);
      setNameRu(ru);
      setIcon(autoIcon);
      setAutoFilled(true);
    }
  }, [nameZh, editing]);

  const handleSave = () => {
    const data: Category = {
      id: editing?.id || uid(),
      name: { zh: nameZh, en: nameEn || nameZh, ru: nameRu || nameZh },
      icon,
      sortOrder: editing?.sortOrder ?? categories.length,
    };
    if (editing) update(editing.id, data);
    else add(data);
    setFormOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t('admin.categories')}</h3>
        <Button size="sm" onClick={openNew}>+ {t('admin.addCategory')}</Button>
      </div>
      <div className="grid gap-2">
        {categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
          <div key={cat.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <span className="font-medium text-sm">{cat.name[lang]}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => openEdit(cat)}>{t('common.edit')}</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(cat.id)} className="text-red-500">{t('common.delete')}</Button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? t('admin.editCategory') : t('admin.addCategory')}>
        <div className="space-y-4">
          <Input
            label="中文"
            value={nameZh}
            onChange={(e) => setNameZh(e.target.value)}
            placeholder="输入中文名称，英文/俄文/图标自动生成"
          />
          {autoFilled && (
            <p className="text-xs text-accent -mt-2">已根据中文自动填充英文、俄文和图标，可手动修改</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`English ${autoFilled ? '(自动)' : ''}`}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className={autoFilled ? 'border-accent/50 bg-accent/5' : ''}
            />
            <Input
              label={`Русский ${autoFilled ? '(自动)' : ''}`}
              value={nameRu}
              onChange={(e) => setNameRu(e.target.value)}
              className={autoFilled ? 'border-accent/50 bg-accent/5' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图标 (Emoji) {autoFilled ? '(自动)' : ''}
            </label>
            <div className="flex items-center gap-3">
              <input
                value={icon}
                onChange={(e) => { setIcon(e.target.value); setAutoFilled(false); }}
                className={`flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${autoFilled ? 'border-accent/50 bg-accent/5' : 'border-gray-200'}`}
              />
              <span className="text-3xl">{icon || '📦'}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={handleSave}>{t('admin.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
