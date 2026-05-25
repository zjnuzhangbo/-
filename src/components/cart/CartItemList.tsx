import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../stores/useCartStore';
import CartItemRow from './CartItemRow';
import EmptyState from '../ui/EmptyState';

export default function CartItemList() {
  const { t } = useTranslation();
  const items = useCartStore((s) => s.items);

  if (items.length === 0) {
    return <EmptyState icon="🛒" title={t('cart.empty')} />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CartItemRow key={`${item.productId}-${item.variantId}`} item={item} />
      ))}
    </div>
  );
}
