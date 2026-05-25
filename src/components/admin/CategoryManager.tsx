import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategoryStore } from '../../stores/useCategoryStore';
import type { Category } from '../../types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { uid } from '../../utils/seedData';

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

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setNameZh(cat.name.zh);
    setNameEn(cat.name.en);
    setNameRu(cat.name.ru);
    setIcon(cat.icon);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setNameZh(''); setNameEn(''); setNameRu('');
    setIcon('📦');
    setFormOpen(true);
  };

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
          <div className="grid grid-cols-3 gap-3">
            <Input label="中文" value={nameZh} onChange={(e) => setNameZh(e.target.value)} />
            <Input label="English" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            <Input label="Русский" value={nameRu} onChange={(e) => setNameRu(e.target.value)} />
          </div>
          <Input label="图标 (Emoji)" value={icon} onChange={(e) => setIcon(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>{t('admin.cancel')}</Button>
            <Button onClick={handleSave}>{t('admin.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
