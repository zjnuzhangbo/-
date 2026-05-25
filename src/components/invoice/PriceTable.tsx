import { useTranslation } from 'react-i18next';
import type { InvoiceItem } from '../../types';
import Input from '../ui/Input';

interface Props {
  items: InvoiceItem[];
  prices: Record<string, number>;
  onPriceChange: (key: string, value: number) => void;
}

export default function PriceTable({ items, prices, onPriceChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 font-medium text-gray-600">{t('admin.name')}</th>
            <th className="text-left py-3 font-medium text-gray-600">{t('admin.model')}</th>
            <th className="text-left py-3 font-medium text-gray-600">{t('cart.qty')}</th>
            <th className="text-right py-3 font-medium text-gray-600">{t('invoice.unitPrice')}</th>
            <th className="text-right py-3 font-medium text-gray-600">{t('invoice.subtotal')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const key = `${item.productId}-${item.variantId}`;
            return (
              <tr key={key} className="border-b border-gray-50">
                <td className="py-3 font-medium text-gray-800">{item.productName}</td>
                <td className="py-3 text-gray-500">{item.model}</td>
                <td className="py-3 text-gray-500">{item.quantity}</td>
                <td className="py-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={prices[key] || ''}
                    onChange={(e) => onPriceChange(key, parseFloat(e.target.value) || 0)}
                    className="w-24 text-right ml-auto"
                  />
                </td>
                <td className="py-3 text-right font-medium text-gray-800">¥{item.subtotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
