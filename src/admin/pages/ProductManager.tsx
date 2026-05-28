import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { productService, categoryService } from '../../shared/services';
import type { Product, Category, Variant, LocalizedString } from '../../shared/types';
import Modal from '../../shared/components/ui/Modal';
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog';
import { useToast } from '../../shared/components/ui/Toast';

const emptyName: LocalizedString = { zh: '', en: '', ru: '' };

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text.trim()) return '';
  const langPair = targetLang === 'en' ? 'zh|en' : 'zh|ru';
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`);
    const data = await res.json();
    return data?.responseData?.translatedText || '';
  } catch {
    return '';
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nameZh: '', nameEn: '', nameRu: '',
    categoryId: '',
  });
  const [variants, setVariants] = useState<Variant[]>([{ id: '', model: '', size: '', weight: '' }]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);
  const translateSeq = useRef(0);

  useEffect(() => {
    productService.getAll().then(setProducts);
    categoryService.getAll().then(setCategories);
  }, []);

  const resetForm = () => {
    setForm({ nameZh: '', nameEn: '', nameRu: '', categoryId: '' });
    setVariants([{ id: '', model: '', size: '', weight: '' }]);
    setImagePreview('');
    setEditing(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const openNewFull = () => { resetForm(); setShowForm(true); };

  const openEditFull = (p: Product) => {
    setForm({
      nameZh: p.name.zh, nameEn: p.name.en, nameRu: p.name.ru,
      categoryId: p.categoryId,
    });
    setVariants(p.variants.length > 0 ? p.variants.map(v => ({ ...v })) : [{ id: '', model: '', size: '', weight: '' }]);
    setEditing(p);
    setImagePreview(p.images[0] || '');
    setShowForm(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setImagePreview(base64);
    } catch {
      toast('图片读取失败', 'error');
    }
  };

  const removeImage = () => {
    setImagePreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const updateVariant = (idx: number, field: keyof Variant, value: string) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { id: '', model: '', size: '', weight: '' }]);
  };

  const removeVariant = (idx: number) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const handleZhNameChange = async (value: string) => {
    setForm(prev => ({ ...prev, nameZh: value, nameEn: '', nameRu: '' }));
    if (!value.trim()) return;
    const seq = ++translateSeq.current;
    const [en, ru] = await Promise.all([
      translateText(value, 'en'),
      translateText(value, 'ru'),
    ]);
    // Discard stale responses
    if (seq !== translateSeq.current) return;
    setForm(prev => ({ ...prev, nameEn: en, nameRu: ru }));
  };

  const saveFull = async () => {
    const images = imagePreview ? [imagePreview] : [];
    const validVariants = variants.filter(v => v.model || v.size || v.weight).map(v => ({
      ...v,
      id: v.id || crypto.randomUUID(),
    }));
    if (validVariants.length === 0) {
      toast('请至少添加一个型号', 'error');
      return;
    }
    const data: Product = {
      id: editing?.id || crypto.randomUUID(),
      name: { zh: form.nameZh, en: form.nameEn || form.nameZh, ru: form.nameRu || form.nameZh },
      description: emptyName,
      categoryId: form.categoryId,
      images,
      variants: validVariants,
      active: editing?.active ?? true,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    if (editing) {
      await productService.update(editing.id, data);
    } else {
      await productService.create(data);
    }
    setShowForm(false);
    resetForm();
    const fresh = await productService.getAll();
    setProducts(fresh);
    toast(editing ? '商品已更新' : '商品已添加');
  };

  const toggleActive = async (p: Product) => {
    await productService.update(p.id, { active: !p.active });
    const fresh = await productService.getAll();
    setProducts(fresh);
  };

  const removeProduct = async (id: string) => {
    await productService.remove(id);
    setDeleteId(null);
    const fresh = await productService.getAll();
    setProducts(fresh);
    toast('商品已删除');
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    const [en, ru] = await Promise.all([
      translateText(newCatName, 'en'),
      translateText(newCatName, 'ru'),
    ]);
    await categoryService.create({
      id: crypto.randomUUID(),
      name: { zh: newCatName, en: en || newCatName, ru: ru || newCatName },
      icon: '',
      sortOrder: categories.length,
    });
    setNewCatName('');
    const fresh = await categoryService.getAll();
    setCategories(fresh);
  };

  const removeCategory = async (id: string) => {
    await categoryService.remove(id);
    const fresh = await categoryService.getAll();
    setCategories(fresh);
  };

  const filtered = products.filter(p => {
    if (search && !p.name.zh.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'all' && p.categoryId !== filterCat) return false;
    if (filterStatus === 'active' && !p.active) return false;
    if (filterStatus === 'inactive' && p.active) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          <input className="input-field w-48" placeholder={t('admin.products.search')} value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input-field w-32" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">{t('admin.products.allCategories')}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name.zh}</option>)}
          </select>
          <select className="input-field w-28" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">{t('admin.products.allStatus')}</option>
            <option value="active">{t('admin.products.active')}</option>
            <option value="inactive">{t('admin.products.inactive')}</option>
          </select>
        </div>
        <button onClick={openNewFull} className="px-4 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-md hover:bg-primary-700 transition-colors">
          {t('admin.products.addProduct')}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.image')}</th>
              <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.name')}</th>
              <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.category')}</th>
              <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.specs')}</th>
              <th className="text-center px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.status')}</th>
              <th className="text-center px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-lg overflow-hidden">
                    {p.images[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : '🔧'}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">{p.name.zh}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{categories.find(c => c.id === p.categoryId)?.name.zh || ''}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {p.variants.map(v => `${v.model} ${v.size}·${v.weight}`).join(' / ')}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold border ${p.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {p.active ? t('admin.products.activeBadge') : t('admin.products.inactiveBadge')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-1.5 justify-center">
                    <button onClick={() => openEditFull(p)} className="px-2.5 py-1 text-xs text-primary-600 border border-slate-200 rounded-md hover:bg-slate-50">{t('admin.products.edit')}</button>
                    <button onClick={() => toggleActive(p)} className={`px-2.5 py-1 text-xs border rounded-md hover:bg-slate-50 ${p.active ? 'text-red-500 border-slate-200' : 'text-emerald-600 border-slate-200'}`}>
                      {p.active ? t('admin.products.deactivate') : t('admin.products.activate')}
                    </button>
                    {!p.active && (
                      <button onClick={() => setDeleteId(p.id)} className="px-2.5 py-1 text-xs text-red-500 border border-red-200 rounded-md hover:bg-red-50">删除</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category management */}
      <div className="mt-6 bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-display text-base text-slate-800 mb-3">{t('admin.products.categoryMgmt')}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map(c => (
            <span key={c.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-pill text-xs font-medium text-slate-600">
              {c.name.zh}
              <button onClick={() => removeCategory(c.id)} className="text-slate-400 hover:text-red-500 ml-0.5">&times;</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input-field w-48" placeholder={t('admin.products.addCategory')} value={newCatName} onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()} />
          <button onClick={addCategory} className="px-3 py-2 text-xs font-semibold text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50">{t('admin.products.addCategory')}</button>
        </div>
      </div>

      {/* Product form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? t('admin.products.edit') : t('admin.products.addProduct')}>
        <div className="flex flex-col gap-3 w-[600px] max-w-full max-h-[70vh] overflow-auto pr-1">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-slate-500">名称 (中文) *</label>
              <input className="input-field mt-0.5" value={form.nameZh} onChange={e => handleZhNameChange(e.target.value)} placeholder="输入中文名称" />
            </div>
            <div>
              <label className="text-xs text-slate-500">名称 (英文)</label>
              <input className="input-field mt-0.5" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} placeholder="自动生成" />
            </div>
            <div>
              <label className="text-xs text-slate-500">名称 (俄文)</label>
              <input className="input-field mt-0.5" value={form.nameRu} onChange={e => setForm({...form, nameRu: e.target.value})} placeholder="自动生成" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">分类</label>
            <select className="input-field mt-0.5" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
              <option value="">请选择</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name.zh}</option>)}
            </select>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">商品实物图</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="预览" className="w-32 h-32 object-cover rounded-lg border border-slate-200" />
                <button onClick={removeImage} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">&times;</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                <span className="text-2xl text-slate-300">+</span>
                <span className="text-[10px] text-slate-400 mt-1">上传图片</span>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>

          {/* Multi-variant editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-500 font-semibold">产品型号</label>
              <button type="button" onClick={addVariant} className="text-xs text-primary-600 font-semibold hover:text-primary-700">+ 添加型号</button>
            </div>
            <div className="flex flex-col gap-2">
              {variants.map((v, idx) => (
                <div key={idx} className="flex gap-2 items-start p-2.5 bg-slate-50 rounded-md border border-slate-100">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">型号</label>
                      <input className="input-field mt-0.5 text-xs py-1.5" value={v.model} onChange={e => updateVariant(idx, 'model', e.target.value)} placeholder="如: 标准型" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">尺寸</label>
                      <input className="input-field mt-0.5 text-xs py-1.5" value={v.size} onChange={e => updateVariant(idx, 'size', e.target.value)} placeholder="如: 32mm" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">重量</label>
                      <input className="input-field mt-0.5 text-xs py-1.5" value={v.weight} onChange={e => updateVariant(idx, 'weight', e.target.value)} placeholder="如: 2.4kg" />
                    </div>
                  </div>
                  {variants.length > 1 && (
                    <button onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600 text-sm mt-4 shrink-0">&times;</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
            <button onClick={saveFull} className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700">保存</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && removeProduct(deleteId)}
        title="删除商品"
        message="确定要永久删除此商品吗？此操作不可撤销。"
      />
    </div>
  );
}
