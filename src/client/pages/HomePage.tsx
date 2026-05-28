import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService, categoryService } from '../../shared/services';
import type { Product, Category } from '../../shared/types';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

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

  const filtered = products.filter(p => {
    if (!p.active) return false;
    const name = p.name.zh;
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategories.size > 0 && !selectedCategories.has(p.categoryId)) return false;
    return true;
  });

  const addToOrder = (product: Product) => {
    const existing = JSON.parse(localStorage.getItem('tricycle_cart') || '[]');
    const variantId = selectedVariants[product.id] || product.variants[0]?.id || '';
    const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
    existing.push({
      productId: product.id,
      variantId: variant?.id || '',
      productName: product.name.zh,
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

      <div className="max-w-7xl mx-auto px-4 py-6 flex-1">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            className="input-field flex-1"
            placeholder={t('home.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-pill text-xs font-semibold border transition-colors
                  ${selectedCategories.has(cat.id)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}
              >
                {cat.icon} {cat.name.zh}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="text-4xl block mb-3">🔧</span>
            <p>{t('home.noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {filtered.map(product => {
              const hasVariants = product.variants.length > 0;
              const hasMultipleVariants = product.variants.length > 1;
              const currentVariant = selectedVariants[product.id] || product.variants[0]?.id || '';

              return (
                <div key={product.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-36 bg-slate-100 flex items-center justify-center text-3xl">
                    {product.images[0] ? <img src={product.images[0]} alt={product.name.zh} className="w-full h-full object-cover" /> : '🔧'}
                  </div>
                  <div className="p-3">
                    <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-pill">
                      {categories.find(c => c.id === product.categoryId)?.name.zh || ''}
                    </span>
                    <h3 className="font-semibold text-slate-800 mt-2 text-sm">{product.name.zh}</h3>

                    {hasMultipleVariants ? (
                      <div className="mt-2">
                        <select
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs outline-none focus:border-primary-400"
                          value={currentVariant}
                          onChange={e => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
                        >
                          {product.variants.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.model} — {v.size} · {v.weight}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : hasVariants ? (
                      <p className="text-xs text-slate-400 mt-1">
                        {product.variants[0].model} — {product.variants[0].size} · {product.variants[0].weight}
                      </p>
                    ) : null}

                    <button
                      onClick={() => addToOrder(product)}
                      className="mt-3 w-full py-2 bg-primary-600 text-white text-xs font-semibold rounded-md hover:bg-primary-700 transition-colors"
                    >
                      {t('home.orderBtn')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
