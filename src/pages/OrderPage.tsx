import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/useCartStore';
import CartItemList from '../components/cart/CartItemList';

export default function OrderPage() {
  const { t } = useTranslation();
  const items = useCartStore((s) => s.items);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('cart.title')}</h1>
      <CartItemList />
      {items.length > 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">
          {t('cart.contactForPricing')}
        </p>
      )}
    </div>
  );
}
