import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/useCartStore';
import { useProductStore } from '../stores/useProductStore';
import { useInvoiceStore } from '../stores/useInvoiceStore';
import CartItemList from '../components/cart/CartItemList';
import PriceTable from '../components/invoice/PriceTable';
import ExportButtons from '../components/invoice/ExportButtons';
import TotalBar from '../components/invoice/TotalBar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { uid } from '../utils/seedData';
import type { Invoice, InvoiceItem } from '../types';

export default function OrderPage() {
  const { t } = useTranslation();
  const { items, clearCart } = useCartStore();
  const products = useProductStore((s) => s.products);
  const createInvoice = useInvoiceStore((s) => s.create);

  const [step, setStep] = useState<1 | 2>(1);
  const [customerName, setCustomerName] = useState('');

  const invoiceItems = useMemo(() => {
    return items.map((ci) => {
      const product = products.find((p) => p.id === ci.productId);
      const variant = product?.variants.find((v) => v.id === ci.variantId);
      return {
        cartItem: ci,
        product,
        variant,
      };
    }).filter((x) => x.product && x.variant);
  }, [items, products]);

  const [prices, setPrices] = useState<Record<string, number>>({});

  const invoiceData: InvoiceItem[] = useMemo(() => {
    return invoiceItems.map(({ cartItem, product, variant }) => {
      const unitPrice = prices[`${cartItem.productId}-${cartItem.variantId}`] || 0;
      const spec = `${variant!.size} / ${variant!.weight}`;
      return {
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        productName: product!.name.zh,
        model: variant!.model,
        spec,
        quantity: cartItem.quantity,
        unitPrice,
        subtotal: unitPrice * cartItem.quantity,
      };
    });
  }, [invoiceItems, prices]);

  const totalAmount = invoiceData.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCreateInvoice = () => {
    const invoice: Invoice = {
      id: uid(),
      customerName: customerName || 'Unnamed',
      items: invoiceData,
      totalAmount,
      createdAt: new Date().toISOString(),
    };
    createInvoice(invoice);
    clearCart();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary' : 'text-gray-400'}`}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-current text-white">1</span>
          <span className="text-sm font-medium">{t('cart.title')}</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary' : 'text-gray-400'}`}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-current text-white">2</span>
          <span className="text-sm font-medium">{t('invoice.title')}</span>
        </div>
      </div>

      {step === 1 && (
        <>
          <CartItemList />
          {items.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)}>{t('cart.next')}</Button>
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Input
            label={t('invoice.customerName')}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={t('invoice.customerName')}
          />
          <PriceTable items={invoiceData} prices={prices} onPriceChange={(key, val) => setPrices((prev) => ({ ...prev, [key]: val }))} />
          <TotalBar total={totalAmount} />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>{t('invoice.back')}</Button>
            <div className="flex gap-2">
              <ExportButtons invoiceData={invoiceData} totalAmount={totalAmount} customerName={customerName} onExport={handleCreateInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
