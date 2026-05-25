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
  const [imgLoaded, setImgLoaded] = useState(false);
  const lang = i18n.language as 'zh' | 'en' | 'ru';

  const hasVariants = product.variants.length > 0;

  const handleAddToCart = (e: React.MouseEvent, variantId?: string) => {
    e.stopPropagation();
    addItem(product.id, variantId || 'default');
    toast(t('common.success'), 'success');
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-500 ease-out">
      <div
        className="relative aspect-[4/3] bg-gray-50 cursor-pointer overflow-hidden"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {product.images[0] ? (
          <>
            <div className={`absolute inset-0 bg-gray-100 transition-opacity duration-500 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`} />
            <img
              src={product.images[0]}
              alt={product.name[lang]}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-30">📦</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {hasVariants && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {product.variants.length} {t('home.variants')}
          </span>
        )}
      </div>

      <div className="p-4">
        <span className="text-[11px] text-primary/70 font-medium tracking-wide uppercase">{categoryName}</span>
        <h3
          className="text-[15px] font-semibold text-gray-800 mt-1 cursor-pointer hover:text-primary transition-colors line-clamp-1"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name[lang]}
        </h3>

        {hasVariants ? (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary mt-2 font-medium flex items-center gap-1 transition-colors"
            >
              {product.variants.length} {t('home.variants')}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {expanded && (
              <div className="mt-3 space-y-1.5 animate-in">
                {product.variants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-xs bg-gray-50/80 rounded-xl px-3 py-2.5 hover:bg-gray-100/80 transition-colors">
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-700">{v.model}</span>
                      <span className="text-gray-400 ml-2 hidden sm:inline">{v.size} / {v.weight}</span>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, v.id)}
                      className="flex-shrink-0 ml-2 px-3.5 py-1.5 bg-primary text-white rounded-full text-[11px] font-semibold hover:bg-primary-600 hover:shadow-md hover:shadow-primary/20 transition-all duration-200 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <button
            onClick={(e) => handleAddToCart(e)}
            className="mt-3 w-full px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 active:scale-95"
          >
            {t('home.addToCart')}
          </button>
        )}
      </div>
    </div>
  );
}
