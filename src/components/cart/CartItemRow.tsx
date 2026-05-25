import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '../../stores/useProductStore';
import { useCartStore } from '../../stores/useCartStore';
import type { CartItem } from '../../types';

interface Props {
  item: CartItem;
}

export default function CartItemRow({ item }: Props) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en' | 'ru';
  const product = useProductStore((s) => s.getById(item.productId));
  const variant = item.variantId !== 'default' ? product?.variants.find((v) => v.id === item.variantId) : null;
  const { updateQty, removeItem } = useCartStore();
  const [inputVal, setInputVal] = useState(String(item.quantity));

  if (!product) return null;

  const handleQtyChange = (val: number) => {
    const qty = Math.max(1, val);
    updateQty(item.productId, item.variantId, qty);
    setInputVal(String(qty));
  };

  const handleInputBlur = () => {
    const num = parseInt(inputVal, 10);
    if (isNaN(num) || num < 1) {
      setInputVal(String(item.quantity));
    } else {
      handleQtyChange(num);
    }
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
        {product.images[0] ? (
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 truncate">{product.name[lang]}</h4>
        {variant && (
          <p className="text-xs text-gray-400">{variant.model} | {variant.size} | {variant.weight}</p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleQtyChange(item.quantity - 1)}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors text-sm"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={(e) => { if (e.key === 'Enter') handleInputBlur(); }}
          className="w-12 h-7 text-center text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={() => handleQtyChange(item.quantity + 1)}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors text-sm"
        >
          +
        </button>
      </div>
      <button
        onClick={() => removeItem(item.productId, item.variantId)}
        className="text-gray-400 hover:text-red-500 transition-colors text-sm flex-shrink-0"
      >
        {t('cart.remove')}
      </button>
    </div>
  );
}
