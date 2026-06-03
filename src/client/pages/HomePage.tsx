import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService, categoryService } from '../../shared/services';
import { localName } from '../../shared/utils';
import type { Product, Category } from '../../shared/types';

export default function HomePage() {
  const FILTER_CACHE_KEY = 'tricycle_home_filters';
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(() => {
    try {
      const cached = sessionStorage.getItem(FILTER_CACHE_KEY);
      if (cached) return JSON.parse(cached).search || '';
    } catch { /* ignore */ }
    return '';
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
    try {
      const cached = sessionStorage.getItem(FILTER_CACHE_KEY);
      if (cached) return new Set<string>(JSON.parse(cached).categories || []);
    } catch { /* ignore */ }
    return new Set();
  });
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());
  useEffect(() => {
    productService.getAll().then(setProducts);
    categoryService.getAll().then(setCategories);
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.setItem(FILTER_CACHE_KEY, JSON.stringify({
        search,
        categories: [...selectedCategories],
      }));
    };
  }, [search, selectedCategories]);

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
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = localName(p.name, lang).toLowerCase().includes(q);
      const variantMatch = p.variants.some(v =>
        v.model.toLowerCase().includes(q) ||
        v.size.toLowerCase().includes(q) ||
        v.weight.toLowerCase().includes(q)
      );
      if (!nameMatch && !variantMatch) return false;
    }
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
        quantity: quantities[product.id] || 1,
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
      quantity: quantities[product.id] || 1,
    });
    localStorage.setItem('tricycle_cart', JSON.stringify(existing));
    navigate('/order');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-slate-800 text-white py-3 px-4 text-center">
        <h1 className="font-display text-sm md:text-base tracking-wide">{t('home.title')} · {t('app.companyName')}</h1>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-[56px] z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              className="input-field flex-1 max-w-md"
              placeholder={t('home.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5">
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
        </div>
      </div>

      {/* Product grid */}
      <div className="px-4 md:px-6 py-6 flex-1 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="text-4xl block mb-3">🔧</span>
            <p>{t('home.noProducts')}</p>
          </div>
        ) : (
          /* ---- Grid View ---- */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
            {filtered.map(product => {
              const hasMultipleVariants = product.variants.length > 1;
              const currentVariant = selectedVariants[product.id] || product.variants[0]?.id || '';
              const isChecked = checked.has(product.id);
              const catName = localName(categories.find(c => c.id === product.categoryId)?.name || { zh: '', en: '', ru: '' }, lang);

              return (
                <div
                  key={product.id}
                  onClick={() => toggleCheck(product.id)}
                  className={`group bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer
                    hover:-translate-y-1 hover:shadow-lg
                    ${isChecked ? 'border-primary-500 shadow-md ring-2 ring-primary-200 bg-primary-50/50' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
                >
                  {/* Image area */}
                  <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={localName(product.name, lang)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-4xl text-slate-300 font-display select-none">
                        {localName(product.name, lang).slice(0, 2)}
                      </span>
                    )}
                    {/* Checkbox */}
                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm
                      ${isChecked ? 'bg-primary-600 border-primary-600' : 'bg-white/90 border-slate-300 group-hover:border-primary-400'}`}>
                      {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                  </div>

                  {/* Info area */}
                  <div className="p-4">
                    <span className="inline-block text-[10px] text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-pill mb-2">
                      {catName}
                    </span>
                    <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-2">{localName(product.name, lang)}</h3>

                    {hasMultipleVariants ? (
                      <select
                        className="w-full mb-2 px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-slate-50"
                        value={currentVariant}
                        onClick={e => e.stopPropagation()}
                        onChange={e => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
                      >
                        {product.variants.map(v => (
                          <option key={v.id} value={v.id}>{v.model} · {v.size} · {v.weight}</option>
                        ))}
                      </select>
                    ) : product.variants[0] ? (
                      <p className="text-xs text-slate-400 mb-2">
                        {product.variants[0].model} · {product.variants[0].size} · {product.variants[0].weight}
                      </p>
                    ) : null}

                    {/* Quantity */}
                    <div className="flex items-center gap-2 mb-2" onClick={e => e.stopPropagation()}>
                      <span className="text-xs text-slate-500">{t('home.quantity')}</span>
                      <input
                        type="number"
                        min="1"
                        value={quantities[product.id] || 1}
                        onChange={e => setQuantities(prev => ({ ...prev, [product.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="flex-1 w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center outline-none focus:border-primary-400"
                      />
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); quickOrder(product); }}
                      className="w-full py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors"
                    >
                      {t('home.quickOrder')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {checked.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-xl z-30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              已选 <span className="text-primary-600">{checked.size}</span> 件商品
            </span>
            <button
              onClick={submitChecked}
              className="px-8 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-all shadow-lg shadow-primary-200"
            >
              提交订单 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
