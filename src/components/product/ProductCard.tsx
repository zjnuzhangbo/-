import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../types';
import { useCartStore } from '../../stores/useCartStore';
import { toast } from '../ui/Toast';

interface Props {
  product: Product;
  categoryName: string;
}

export default function ProductCard({ product, categoryName }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [expanded, setExpanded] = useState(false);
  const lang = i18n.language as 'zh' | 'en' | 'ru';

  const hasVariants = product.variants.length > 0;

  const handleAddToCart = (variantId: string) => {
    addItem(product.id, variantId);
    toast(t('common.success'), 'success');
  };

  return (
    <div className="bg-white rounded-card border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div
        className="aspect-square bg-gray-50 cursor-pointer overflow-hidden"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name[lang]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs text-primary font-medium">{categoryName}</span>
        <h3
          className="text-sm font-semibold text-gray-800 mt-0.5 cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name[lang]}
        </h3>
        {hasVariants && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary mt-1.5 font-medium hover:underline flex items-center gap-1"
          >
            {product.variants.length} {t('home.variants')}
            <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
        )}
        {expanded && hasVariants && (
          <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
            {product.variants.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                <div>
                  <span className="font-medium text-gray-700">{v.model}</span>
                  <span className="text-gray-400 ml-2">{v.size} / {v.weight}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(v.id)}
                  disabled={v.stock <= 0}
                  className="px-3 py-1 bg-primary text-white rounded-md text-[10px] font-medium hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {t('home.addToCart')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
