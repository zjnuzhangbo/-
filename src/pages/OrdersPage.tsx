import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInvoiceStore } from '../stores/useInvoiceStore';
import EmptyState from '../components/ui/EmptyState';

export default function OrdersPage() {
  const { t } = useTranslation();
  const { invoices, load } = useInvoiceStore();

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('orders.title')}</h1>
      {invoices.length === 0 ? (
        <EmptyState title={t('orders.empty')} />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-card border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{inv.customerName}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(inv.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">¥{inv.totalAmount.toFixed(2)}</span>
                  <p className="text-xs text-gray-400">{inv.items.length} items</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
