import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/useCartStore';
import { useProductStore } from '../stores/useProductStore';
import { useInvoiceStore } from '../stores/useInvoiceStore';
import CartItemList from '../components/cart/CartItemList';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { uid } from '../utils/seedData';
import type { Invoice, InvoiceItem } from '../types';

export default function OrderPage() {
  const { t } = useTranslation();
  const { items, clearCart } = useCartStore();
  const products = useProductStore((s) => s.products);
  const createInvoice = useInvoiceStore((s) => s.create);
  const [customerName, setCustomerName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const invoiceItems = useMemo(() => {
    return items.map((ci) => {
      const product = products.find((p) => p.id === ci.productId);
      const variant = product?.variants.find((v) => v.id === ci.variantId);
      if (!product || !variant) return null;
      const spec = `${variant.size} / ${variant.weight}`;
      return {
        productId: ci.productId,
        variantId: ci.variantId,
        productName: product.name.zh,
        model: variant.model,
        spec,
        quantity: ci.quantity,
        unitPrice: 0,
        subtotal: 0,
      } as InvoiceItem;
    }).filter(Boolean) as InvoiceItem[];
  }, [items, products]);

  const handleSubmit = () => {
    const invoice: Invoice = {
      id: uid(),
      customerName: customerName || 'Unnamed',
      items: invoiceItems,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    createInvoice(invoice);
    clearCart();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">&#10003;</span>
        </div>
        <h2 className="text-xl font-bold text-green-700 mb-2">{t('order.submitted')}</h2>
        <p className="text-gray-500">{t('order.submittedDesc')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('cart.title')}</h1>

      {items.length === 0 ? (
        <p className="text-gray-400 text-center py-16">{t('cart.empty')}</p>
      ) : (
        <>
          <CartItemList />
          <div className="mt-8 max-w-md">
            <Input
              label={t('invoice.customerName')}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('invoice.customerName')}
            />
            <div className="mt-4">
              <Button onClick={handleSubmit} className="w-full">
                {t('order.submit')}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
