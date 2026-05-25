import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInvoiceStore } from '../../stores/useInvoiceStore';
import EmptyState from '../ui/EmptyState';

export default function OrderHistory() {
  const { t } = useTranslation();
  const { invoices, load } = useInvoiceStore();

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('admin.history')}</h3>
      {invoices.length === 0 ? (
        <EmptyState title={t('orders.empty')} />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <details key={inv.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <summary className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-sm">{inv.customerName}</span>
                  <span className="text-xs text-gray-400 ml-3">{new Date(inv.createdAt).toLocaleString()}</span>
                </div>
                <span className="text-sm font-bold text-primary">¥{inv.totalAmount.toFixed(2)}</span>
              </summary>
              <div className="mt-3 border-t border-gray-100 pt-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="text-left py-1">产品</th>
                      <th className="text-left py-1">型号</th>
                      <th className="text-right py-1">数量</th>
                      <th className="text-right py-1">单价</th>
                      <th className="text-right py-1">小计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="py-1">{item.productName}</td>
                        <td className="py-1 text-gray-500">{item.model}</td>
                        <td className="py-1 text-right">{item.quantity}</td>
                        <td className="py-1 text-right">¥{item.unitPrice.toFixed(2)}</td>
                        <td className="py-1 text-right">¥{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
