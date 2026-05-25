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
  const variant = product?.variants.find((v) => v.id === item.variantId);
  const { updateQty, removeItem } = useCartStore();

  if (!product || !variant) return null;

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100">
      <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
        {product.images[0] ? (
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 truncate">{product.name[lang]}</h4>
        <p className="text-xs text-gray-400">{variant.model} | {variant.size} | {variant.weight}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors"
        >
          +
        </button>
      </div>
      <button
        onClick={() => removeItem(item.productId, item.variantId)}
        className="text-gray-400 hover:text-red-500 transition-colors text-sm"
      >
        {t('cart.remove')}
      </button>
    </div>
  );
}
