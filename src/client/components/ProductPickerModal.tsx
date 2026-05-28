import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../shared/components/ui/Modal';
import { productService, categoryService } from '../../shared/services';
import { localName } from '../../shared/utils';
import type { Product, Category } from '../../shared/types';

interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  model: string;
  spec: string;
  quantity: number;
}

interface ProductPickerModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}

export default function ProductPickerModal({ open, onClose, onAdd }: ProductPickerModalProps) {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const lang = i18n.language;

  useEffect(() => {
    productService.getAll().then(p => setProducts(p.filter(x => x.active)));
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
    if (search && !localName(p.name, lang).toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategories.size > 0 && !selectedCategories.has(p.categoryId)) return false;
    return true;
  });

  const handleAdd = (product: Product) => {
    const variantId = selectedVariants[product.id] || product.variants[0]?.id || '';
    const v = product.variants.find(x => x.id === variantId) || product.variants[0];
    onAdd({
      productId: product.id,
      variantId: v?.id || '',
      productName: localName(product.name, lang),
      model: v?.model || '',
      spec: v ? `${v.size} · ${v.weight}` : '',
      quantity: 1,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="添加商品">
      <div className="w-[720px] max-w-full">
        <input
          className="input-field mb-3"
          placeholder={t('home.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {categories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`shrink-0 px-2.5 py-1 rounded-pill text-[11px] font-semibold border transition-colors
                  ${selectedCategories.has(cat.id)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}
              >
                {localName(cat.name, lang)}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <span className="text-3xl block mb-2">🔧</span>
            <p className="text-sm">未找到匹配商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,180px))] gap-2.5 max-h-[55vh] overflow-auto pr-1">
            {filtered.map(product => {
              const hasMultipleVariants = product.variants.length > 1;
              const catName = localName(categories.find(c => c.id === product.categoryId)?.name || { zh: '', en: '', ru: '' }, lang);
              return (
                <div key={product.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="h-24 bg-slate-100 flex items-center justify-center text-xl">
                    {product.images[0] ? <img src={product.images[0]} alt={localName(product.name, lang)} className="w-full h-full object-cover" /> : '🔧'}
                  </div>
                  <div className="p-2">
                    <span className="text-[10px] text-primary-600 font-semibold bg-primary-50 px-1.5 py-0.5 rounded-pill">{catName}</span>
                    <h4 className="font-semibold text-slate-800 mt-1 text-[11px] leading-tight">{localName(product.name, lang)}</h4>

                    {hasMultipleVariants ? (
                      <select
                        className="w-full mt-1 px-1.5 py-1 border border-slate-200 rounded-md text-[10px] outline-none focus:border-primary-400"
                        value={selectedVariants[product.id] || product.variants[0]?.id || ''}
                        onChange={e => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
                      >
                        {product.variants.map(v => (
                          <option key={v.id} value={v.id}>{v.model} {v.size}·{v.weight}</option>
                        ))}
                      </select>
                    ) : product.variants[0] ? (
                      <p className="text-[10px] text-slate-400 mt-1">
                        {product.variants[0].model} {product.variants[0].size}·{product.variants[0].weight}
                      </p>
                    ) : null}

                    <button
                      onClick={() => handleAdd(product)}
                      className="mt-1.5 w-full py-1.5 bg-primary-600 text-white text-[11px] font-semibold rounded-md hover:bg-primary-700 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
