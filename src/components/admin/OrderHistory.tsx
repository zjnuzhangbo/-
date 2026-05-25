import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInvoiceStore } from '../../stores/useInvoiceStore';
import PriceTable from '../invoice/PriceTable';
import ExportButtons from '../invoice/ExportButtons';
import TotalBar from '../invoice/TotalBar';
import EmptyState from '../ui/EmptyState';
import type { InvoiceItem } from '../../types';

export default function OrderHistory() {
  const { t } = useTranslation();
  const { invoices, load } = useInvoiceStore();
  const [editingPrices, setEditingPrices] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => { load(); }, []);

  const getPricedItems = (invId: string, items: InvoiceItem[]): InvoiceItem[] => {
    const prices = editingPrices[invId] || {};
    return items.map((item) => {
      const key = `${item.productId}-${item.variantId}`;
      const unitPrice = prices[key] ?? item.unitPrice;
      return { ...item, unitPrice, subtotal: unitPrice * item.quantity };
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('admin.history')}</h3>
      {invoices.length === 0 ? (
        <EmptyState title={t('orders.empty')} />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const isPending = inv.status !== 'priced';
            const pricedItems = getPricedItems(inv.id, inv.items);
            const computedTotal = pricedItems.reduce((sum, i) => sum + i.subtotal, 0);

            return (
              <details key={inv.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <summary className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{inv.customerName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(inv.createdAt).toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {isPending ? t('invoice.pending') : t('invoice.priced')}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {isPending ? '-' : `¥${inv.totalAmount.toFixed(2)}`}
                  </span>
                </summary>

                <div className="mt-3 border-t border-gray-100 pt-3">
                  {isPending ? (
                    <div className="space-y-4">
                      <PriceTable
                        items={pricedItems}
                        prices={editingPrices[inv.id] || {}}
                        onPriceChange={(key, val) =>
                          setEditingPrices((prev) => ({
                            ...prev,
                            [inv.id]: { ...(prev[inv.id] || {}), [key]: val },
                          }))
                        }
                      />
                      <TotalBar total={computedTotal} />
                      <div className="flex justify-end gap-2">
                        <ExportButtons
                          invoiceData={pricedItems}
                          totalAmount={computedTotal}
                          customerName={inv.customerName}
                          onExport={() => {
                            useInvoiceStore.getState().updateInvoice(inv.id, {
                              items: pricedItems,
                              totalAmount: computedTotal,
                              status: 'priced',
                            });
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-left py-1">{t('admin.name')}</th>
                          <th className="text-left py-1">{t('admin.model')}</th>
                          <th className="text-right py-1">{t('cart.qty')}</th>
                          <th className="text-right py-1">{t('invoice.unitPrice')}</th>
                          <th className="text-right py-1">{t('invoice.subtotal')}</th>
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
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
