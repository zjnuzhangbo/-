import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService, categoryService } from '../../shared/services';
import { localName } from '../../shared/utils';
import type { Product, Category } from '../../shared/types';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    productService.getAll().then(setProducts);
    categoryService.getAll().then(setCategories);
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const lang = i18n.language;

  const filtered = products.filter(p => {
    if (!p.active) return false;
    if (search && !localName(p.name, lang).toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategories.size > 0 && !selectedCategories.has(p.categoryId)) return false;
    return true;
  });

  const toggleCheck = (productId: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const selectAll = () => {
    if (checked.size === filtered.length) {
      setChecked(new Set());
    } else {
      setChecked(new Set(filtered.map(p => p.id)));
    }
  };

  const submitChecked = () => {
    const existing = JSON.parse(localStorage.getItem('tricycle_cart') || '[]');
    for (const productId of checked) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;
      const variantId = selectedVariants[product.id] || product.variants[0]?.id || '';
      const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
      existing.push({
        productId: product.id,
        variantId: variant?.id || '',
        productName: localName(product.name, lang),
        model: variant?.model || '',
        spec: variant ? `${variant.size} · ${variant.weight}` : '',
        quantity: 1,
      });
    }
    localStorage.setItem('tricycle_cart', JSON.stringify(existing));
    navigate('/order');
  };

  const quickOrder = (product: Product) => {
    const existing = JSON.parse(localStorage.getItem('tricycle_cart') || '[]');
    const variantId = selectedVariants[product.id] || product.variants[0]?.id || '';
    const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
    existing.push({
      productId: product.id,
      variantId: variant?.id || '',
      productName: localName(product.name, lang),
      model: variant?.model || '',
      spec: variant ? `${variant.size} · ${variant.weight}` : '',
      quantity: 1,
    });
    localStorage.setItem('tricycle_cart', JSON.stringify(existing));
    navigate('/order');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-b from-slate-800 to-slate-700 text-white py-16 px-4 text-center">
        <h1 className="font-display text-3xl md:text-4xl mb-2">{t('home.title')}</h1>
        <p className="text-slate-300 text-sm">{t('home.subtitle')}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex-1 pb-20">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            className="input-field flex-1"
            placeholder={t('home.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto flex-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-pill text-xs font-semibold border transition-colors
                    ${selectedCategories.has(cat.id)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}
                >
                  {localName(cat.name, lang)}
                </button>
              ))}
            </div>
          )}
          {filtered.length > 0 && (
            <button onClick={selectAll} className="shrink-0 text-xs text-primary-600 font-semibold hover:text-primary-700">
              {checked.size === filtered.length ? '取消全选' : '全选'}
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="text-4xl block mb-3">🔧</span>
            <p>{t('home.noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,220px))] gap-3">
            {filtered.map(product => {
              const hasMultipleVariants = product.variants.length > 1;
              const currentVariant = selectedVariants[product.id] || product.variants[0]?.id || '';
              const isChecked = checked.has(product.id);
              const catName = localName(categories.find(c => c.id === product.categoryId)?.name || { zh: '', en: '', ru: '' }, lang);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg border-2 overflow-hidden transition-all cursor-pointer
                    ${isChecked ? 'border-primary-500 shadow-md ring-1 ring-primary-200' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
                  onClick={() => toggleCheck(product.id)}
                >
                  <div className="h-32 bg-slate-100 flex items-center justify-center text-2xl relative">
                    {product.images[0] ? <img src={product.images[0]} alt={localName(product.name, lang)} className="w-full h-full object-cover" /> : '🔧'}
                    <div className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                      ${isChecked ? 'bg-primary-600 border-primary-600' : 'bg-white/80 border-slate-300'}`}>
                      {isChecked && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] text-primary-600 font-semibold bg-primary-50 px-1.5 py-0.5 rounded-pill">
                      {catName}
                    </span>
                    <h3 className="font-semibold text-slate-800 mt-1.5 text-xs leading-tight">{localName(product.name, lang)}</h3>

                    {hasMultipleVariants ? (
                      <select
                        className="w-full mt-1.5 px-1.5 py-1 border border-slate-200 rounded-md text-[11px] outline-none focus:border-primary-400"
                        value={currentVariant}
                        onClick={e => e.stopPropagation()}
                        onChange={e => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
                      >
                        {product.variants.map(v => (
                          <option key={v.id} value={v.id}>{v.model} {v.size}·{v.weight}</option>
                        ))}
                      </select>
                    ) : product.variants[0] ? (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {product.variants[0].model} {product.variants[0].size}·{product.variants[0].weight}
                      </p>
                    ) : null}

                    <button
                      onClick={e => { e.stopPropagation(); quickOrder(product); }}
                      className="mt-2 w-full py-1.5 bg-primary-600 text-white text-[11px] font-semibold rounded-md hover:bg-primary-700 transition-colors"
                    >
                      立即订购
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {checked.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary-200 shadow-lg z-30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              已选 <span className="text-primary-600">{checked.size}</span> 件商品
            </span>
            <button
              onClick={submitChecked}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-md hover:bg-primary-700 transition-colors"
            >
              提交订单 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
