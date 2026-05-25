import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Product, Variant } from '../../types';
import { useCategoryStore } from '../../stores/useCategoryStore';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ImageUploader from '../ui/ImageUploader';
import { uid } from '../../utils/seedData';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initial?: Product | null;
}

function emptyVariant(): Variant {
  return { id: uid(), model: '', size: '', weight: '', stock: 0 };
}

export default function ProductForm({ open, onClose, onSave, initial }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en' | 'ru';
  const categories = useCategoryStore((s) => s.categories);

  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [descZh, setDescZh] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descRu, setDescRu] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);

  useEffect(() => {
    if (initial) {
      setNameZh(initial.name.zh);
      setNameEn(initial.name.en);
      setNameRu(initial.name.ru);
      setDescZh(initial.description.zh);
      setDescEn(initial.description.en);
      setDescRu(initial.description.ru);
      setCategoryId(initial.categoryId);
      setImages(initial.images);
      setVariants(initial.variants.length > 0 ? initial.variants : [emptyVariant()]);
    } else {
      setNameZh(''); setNameEn(''); setNameRu('');
      setDescZh(''); setDescEn(''); setDescRu('');
      setCategoryId('');
      setImages([]);
      setVariants([emptyVariant()]);
    }
  }, [initial, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: initial?.id || uid(),
      name: { zh: nameZh, en: nameEn || nameZh, ru: nameRu || nameZh },
      description: { zh: descZh, en: descEn || descZh, ru: descRu || descZh },
      categoryId: categoryId || categories[0]?.id || '',
      images,
      variants: variants.filter((v) => v.model),
      createdAt: initial?.createdAt || new Date().toISOString(),
    };
    onSave(product);
    onClose();
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? t('admin.editProduct') : t('admin.addProduct')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Input label="名称 (中文)" value={nameZh} onChange={(e) => setNameZh(e.target.value)} required />
          <Input label="Name (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          <Input label="Название (RU)" value={nameRu} onChange={(e) => setNameRu(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="描述 (中文)" value={descZh} onChange={(e) => setDescZh(e.target.value)} />
          <Input label="Description (EN)" value={descEn} onChange={(e) => setDescEn(e.target.value)} />
          <Input label="Описание (RU)" value={descRu} onChange={(e) => setDescRu(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.category')}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name[lang]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.images')}</label>
          <ImageUploader images={images} onChange={setImages} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">{t('admin.variants')}</label>
            <Button type="button" size="sm" variant="ghost" onClick={() => setVariants((prev) => [...prev, emptyVariant()])}>
              + {t('admin.addVariant')}
            </Button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 bg-gray-50 rounded-lg p-3 relative">
                <Input placeholder={t('admin.model')} value={v.model} onChange={(e) => updateVariant(i, 'model', e.target.value)} />
                <Input placeholder={t('admin.size')} value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} />
                <Input placeholder={t('admin.weight')} value={v.weight} onChange={(e) => updateVariant(i, 'weight', e.target.value)} />
                <div className="flex items-center gap-1">
                  <Input type="number" placeholder={t('admin.stock')} value={v.stock || ''} onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} />
                  {variants.length > 1 && (
                    <button type="button" onClick={() => setVariants((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-lg">&times;</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>{t('admin.cancel')}</Button>
          <Button type="submit">{t('admin.save')}</Button>
        </div>
      </form>
    </Modal>
  );
}
