import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Product, Variant } from '../../types';
import { useCategoryStore } from '../../stores/useCategoryStore';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ImageUploader from '../ui/ImageUploader';
import { uid } from '../../utils/seedData';
import { translateZh } from '../../utils/translate';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initial?: Product | null;
}

function emptyVariant(): Variant {
  return { id: uid(), model: '', size: '', weight: '' };
}

const keywordMap: Record<string, string[]> = {
  '车轮': ['车轮', '轮胎', '轮毂', '辐条', '轮轴', '内胎', '外胎', '车圈', '轮圈'],
  '刹车': ['刹车', '制动', '刹车片', '刹车线', '刹车鼓', '刹车盘', '刹把'],
  '传动': ['链条', '飞轮', '牙盘', '中轴', '脚踏', '传动', '链轮', '曲柄'],
  '座椅': ['座椅', '座垫', '靠背', '座管', '坐垫', '靠垫'],
  '灯具': ['灯', '喇叭', '电瓶', '转向灯', '大灯', '尾灯', '前灯', '电气'],
  '轴承': ['轴承', '轴套', '垫圈', '滚珠'],
  '螺丝': ['螺丝', '螺栓', '螺母', '垫片', '卡簧', '紧固', '螺钉'],
  '减震': ['减震', '悬挂', '弹簧', '减震器', '前叉', '避震'],
  '车架': ['车架', '车斗', '大梁', '挡泥板', '车把', '车筐'],
  '其他': ['把手', '后视镜', '牌照架', '工具箱', '反光镜', '里程表'],
};

function detectCategory(name: string, categories: { id: string; nameZh: string }[]): string {
  if (!name.trim()) return '';
  for (const [catKey, keywords] of Object.entries(keywordMap)) {
    for (const kw of keywords) {
      if (name.includes(kw)) {
        const match = categories.find((c) => c.nameZh.includes(catKey));
        if (match) return match.id;
      }
    }
  }
  return '';
}

export default function ProductForm({ open, onClose, onSave, initial }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en' | 'ru';
  const categories = useCategoryStore((s) => s.categories);

  const catOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, nameZh: c.name.zh })),
    [categories],
  );

  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [descZh, setDescZh] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descRu, setDescRu] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);
  const [autoCategory, setAutoCategory] = useState('');
  const [autoName, setAutoName] = useState(false);
  const [autoDesc, setAutoDesc] = useState(false);

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
      setAutoCategory('');
      setAutoName(false);
      setAutoDesc(false);
    } else {
      setNameZh(''); setNameEn(''); setNameRu('');
      setDescZh(''); setDescEn(''); setDescRu('');
      setCategoryId('');
      setImages([]);
      setVariants([emptyVariant()]);
      setAutoCategory('');
      setAutoName(false);
      setAutoDesc(false);
    }
  }, [initial, open]);

  useEffect(() => {
    if (initial) return;
    const detected = detectCategory(nameZh, catOptions);
    if (detected && detected !== categoryId) {
      setCategoryId(detected);
      setAutoCategory(detected);
    }
    const { en, ru } = translateZh(nameZh);
    if (en || ru) {
      setNameEn(en);
      setNameRu(ru);
      setAutoName(true);
    }
  }, [nameZh]);

  useEffect(() => {
    if (initial) return;
    const { en, ru } = translateZh(descZh);
    if (en || ru) {
      setDescEn(en);
      setDescRu(ru);
      setAutoDesc(true);
    }
  }, [descZh]);

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
        <div>
          {autoName && (
            <p className="text-xs text-accent mb-1">已根据中文自动翻译英文和俄文，可手动修改</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="名称 (中文)" value={nameZh} onChange={(e) => setNameZh(e.target.value)} required />
            <Input
              label={`Name (EN)${autoName ? ' · 自动' : ''}`}
              value={nameEn}
              onChange={(e) => { setNameEn(e.target.value); setAutoName(false); }}
              className={autoName ? 'border-accent/40 bg-accent/[0.02]' : ''}
            />
            <Input
              label={`Название (RU)${autoName ? ' · 自动' : ''}`}
              value={nameRu}
              onChange={(e) => { setNameRu(e.target.value); setAutoName(false); }}
              className={autoName ? 'border-accent/40 bg-accent/[0.02]' : ''}
            />
          </div>
        </div>
        <div>
          {autoDesc && (
            <p className="text-xs text-accent mb-1">已根据中文自动翻译英文和俄文，可手动修改</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="描述 (中文)" value={descZh} onChange={(e) => setDescZh(e.target.value)} />
            <Input
              label={`Description (EN)${autoDesc ? ' · 自动' : ''}`}
              value={descEn}
              onChange={(e) => { setDescEn(e.target.value); setAutoDesc(false); }}
              className={autoDesc ? 'border-accent/40 bg-accent/[0.02]' : ''}
            />
            <Input
              label={`Описание (RU)${autoDesc ? ' · 自动' : ''}`}
              value={descRu}
              onChange={(e) => { setDescRu(e.target.value); setAutoDesc(false); }}
              className={autoDesc ? 'border-accent/40 bg-accent/[0.02]' : ''}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.category')}
            {autoCategory && (
              <span className="ml-2 text-accent text-xs font-normal">— 已自动识别</span>
            )}
          </label>
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setAutoCategory(''); }}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${autoCategory ? 'border-accent bg-accent/5' : 'border-gray-200'}`}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name[lang]}</option>
            ))}
          </select>
          {autoCategory && (
            <p className="text-xs text-accent mt-1">根据产品名称自动匹配，可手动修改</p>
          )}
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
              <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3 relative">
                <Input placeholder={t('admin.model')} value={v.model} onChange={(e) => updateVariant(i, 'model', e.target.value)} />
                <Input placeholder={t('admin.size')} value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} />
                <div className="flex items-center gap-1">
                  <Input placeholder={t('admin.weight')} value={v.weight} onChange={(e) => updateVariant(i, 'weight', e.target.value)} />
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
