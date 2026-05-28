import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { productService, categoryService } from '../../shared/services';
import type { Product, Category, LocalizedString } from '../../shared/types';
import Modal from '../../shared/components/ui/Modal';
import { useToast } from '../../shared/components/ui/Toast';

const emptyName: LocalizedString = { zh: '', en: '', ru: '' };

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

  const [form, setForm] = useState({
    nameZh: '', nameEn: '', nameRu: '',
    categoryId: '', imageUrl: '', model: '', size: '', weight: '',
  });

  useEffect(() => {
    productService.getAll().then(setProducts);
    categoryService.getAll().then(setCategories);
  }, []);

  const resetForm = () => {
    setForm({ nameZh: '', nameEn: '', nameRu: '', categoryId: '', imageUrl: '', model: '', size: '', weight: '' });
    setEditing(null);
  };

  const openNew = () => { resetForm(); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({
      nameZh: p.name.zh, nameEn: p.name.en, nameRu: p.name.ru,
      categoryId: p.categoryId, imageUrl: p.images[0] || '', model: p.variants[0]?.model || '', size: p.variants[0]?.size || '', weight: p.variants[0]?.weight || '',
    });
    setEditing(p);
    setShowForm(true);
  };

  const save = async () => {
    const variantId = editing?.variants[0]?.id || crypto.randomUUID();
    const data: Product = {
      id: editing?.id || crypto.randomUUID(),
      name: { zh: form.nameZh, en: form.nameEn, ru: form.nameRu },
      description: emptyName,
      categoryId: form.categoryId,
      images: form.imageUrl ? [form.imageUrl] : [],
      variants: [{ id: variantId, model: form.model, size: form.size, weight: form.weight }],
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
    productService.getAll().then(setProducts);
    toast(editing ? '商品已更新' : '商品已添加');
  };

  const toggleActive = async (p: Product) => {
    await productService.update(p.id, { active: !p.active });
    productService.getAll().then(setProducts);
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    await categoryService.create({
      id: crypto.randomUUID(),
      name: { zh: newCatName, en: newCatName, ru: newCatName },
      icon: '📦',
      sortOrder: categories.length,
    });
    setNewCatName('');
    categoryService.getAll().then(setCategories);
  };

  const removeCategory = async (id: string) => {
    await categoryService.remove(id);
    categoryService.getAll().then(setCategories);
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
        <button onClick={openNew} className="px-4 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-md hover:bg-primary-700 transition-colors">
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
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-lg">
                    {p.images[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover rounded-md" /> : '🔧'}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">{p.name.zh}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{categories.find(c => c.id === p.categoryId)?.name.zh || ''}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{p.variants[0] ? `${p.variants[0].size} · ${p.variants[0].weight}` : ''}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold border ${p.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {p.active ? t('admin.products.activeBadge') : t('admin.products.inactiveBadge')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-1.5 justify-center">
                    <button onClick={() => openEdit(p)} className="px-2.5 py-1 text-xs text-primary-600 border border-slate-200 rounded-md hover:bg-slate-50">{t('admin.products.edit')}</button>
                    <button onClick={() => toggleActive(p)} className={`px-2.5 py-1 text-xs border rounded-md hover:bg-slate-50 ${p.active ? 'text-red-500 border-slate-200' : 'text-emerald-600 border-slate-200'}`}>
                      {p.active ? t('admin.products.deactivate') : t('admin.products.activate')}
                    </button>
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
              {c.icon} {c.name.zh}
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
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-xs text-slate-500">名称 (中文)</label><input className="input-field mt-0.5" value={form.nameZh} onChange={e => setForm({...form, nameZh: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">名称 (英文)</label><input className="input-field mt-0.5" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">名称 (俄文)</label><input className="input-field mt-0.5" value={form.nameRu} onChange={e => setForm({...form, nameRu: e.target.value})} /></div>
          </div>
          <div>
            <label className="text-xs text-slate-500">分类</label>
            <select className="input-field mt-0.5" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
              <option value="">请选择</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name.zh}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-slate-500">图片URL</label><input className="input-field mt-0.5" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-xs text-slate-500">型号</label><input className="input-field mt-0.5" value={form.model} onChange={e => setForm({...form, model: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">尺寸</label><input className="input-field mt-0.5" value={form.size} onChange={e => setForm({...form, size: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">重量</label><input className="input-field mt-0.5" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
            <button onClick={save} className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700">保存</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
