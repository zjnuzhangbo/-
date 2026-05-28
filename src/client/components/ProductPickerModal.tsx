import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../shared/components/ui/Modal';
import { productService, categoryService } from '../../shared/services';
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
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    productService.getAll().then(p => setProducts(p.filter(x => x.active)));
    categoryService.getAll().then(setCategories);
  }, []);

  const filtered = products.filter(p => {
    if (!search) return true;
    return p.name.zh.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Modal open={open} onClose={onClose} title="添加商品">
      <input
        className="input-field mb-4"
        placeholder={t('home.search')}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-auto">
        {filtered.map(product => (
          <div key={product.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-md">
            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-lg shrink-0">
              {product.images[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-md" /> : '🔧'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{product.name.zh}</p>
              <p className="text-xs text-slate-400 truncate">
                {categories.find(c => c.id === product.categoryId)?.name.zh || ''}
              </p>
            </div>
            <button
              onClick={() => {
                const v = product.variants[0];
                onAdd({
                  productId: product.id,
                  variantId: v?.id || '',
                  productName: product.name.zh,
                  model: v?.model || '',
                  spec: v ? `${v.size} · ${v.weight}` : '',
                  quantity: 1,
                });
              }}
              className="shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-lg flex items-center justify-center hover:bg-primary-700 transition-colors leading-none"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
