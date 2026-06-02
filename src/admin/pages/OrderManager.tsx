import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { adminOrderService as orderService } from '../../shared/services/supabase/adminService';
import type { Order, OrderItem } from '../../shared/types';
import { useToast } from '../../shared/components/ui/Toast';
import * as XLSX from 'xlsx';

export default function OrderManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pricingInputs, setPricingInputs] = useState<Record<string, string>>({});

  const load = () => { orderService.getAll().then(setOrders); };
  useEffect(load, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      today: orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
      month: orders.filter(o => o.createdAt.startsWith(thisMonth)).length,
    };
  }, [orders]);

  const filtered = orders
    .filter(o => {
      if (filter === 'pending' && o.status !== 'pending') return false;
      if (filter === 'priced' && o.status !== 'priced') return false;
      if (search) {
        const q = search.toLowerCase();
        return o.orderNumber.includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q);
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const expanded = expandedId ? orders.find(o => o.id === expandedId) : null;

  const expandOrder = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setPricingInputs({});
  };

  const setPriceInput = (itemIdx: number, value: string) => {
    setPricingInputs(prev => ({ ...prev, [itemIdx]: value }));
  };

  const getPriceInputValue = (item: OrderItem, idx: number): string => {
    if (pricingInputs[idx] !== undefined) return pricingInputs[idx];
    return item.unitPrice !== undefined ? String(item.unitPrice) : '';
  };

  const savePricing = async () => {
    if (!expanded) return;
    const items = expanded.items.map((item, idx) => {
      const inputVal = getPriceInputValue(item, idx);
      return { ...item, unitPrice: inputVal ? parseFloat(inputVal) : undefined };
    });
    const allPriced = items.every(i => i.unitPrice !== undefined && !isNaN(i.unitPrice));
    await orderService.update(expanded.id, { items, status: allPriced ? 'priced' : 'pending' });
    toast('定价已保存');
    load();
    setExpandedId(null);
  };

  const exportSingle = (order: Order) => {
    const data = order.items.map(item => ({
      '商品': item.productName,
      '规格': item.spec,
      '数量': item.quantity,
      '单价': item.unitPrice ?? '-',
      '小计': item.unitPrice ? item.unitPrice * item.quantity : '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, order.orderNumber);
    XLSX.writeFile(wb, `${order.orderNumber}.xlsx`);
  };

  const exportAll = () => {
    const data = orders.map(o => ({
      '订单号': o.orderNumber,
      '客户': o.customerName,
      '电话': o.customerPhone,
      '地址': o.customerAddress,
      '商品': o.items.map(i => `${i.productName} ×${i.quantity}`).join('; '),
      '总价': o.items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0) || '-',
      '状态': o.status === 'pending' ? '待核算' : '已核算',
      '日期': new Date(o.createdAt).toLocaleDateString('zh-CN'),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '订单');
    XLSX.writeFile(wb, `订单导出_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const orderTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item, idx) => {
      const inputVal = getPriceInputValue(item, idx);
      const price = inputVal ? parseFloat(inputVal) : item.unitPrice;
      return sum + (price && !isNaN(price) ? price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: t('admin.orders.statsPending'), value: stats.pending, color: 'bg-yellow-50 border-yellow-200' },
          { label: t('admin.orders.statsToday'), value: stats.today, color: 'bg-blue-50 border-blue-200' },
          { label: t('admin.orders.statsMonth'), value: stats.month, color: 'bg-emerald-50 border-emerald-200' },
        ].map((s, i) => (
          <div key={i} className={`rounded-lg border ${s.color} p-4`}>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          <input className="input-field w-48" placeholder={t('admin.orders.search')} value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input-field w-28" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">{t('admin.products.allStatus')}</option>
            <option value="pending">{t('admin.orders.pending')}</option>
            <option value="priced">{t('admin.orders.priced')}</option>
          </select>
        </div>
        <button onClick={exportAll} className="px-4 py-2.5 bg-cyan-600 text-white text-xs font-bold rounded-md hover:bg-cyan-700 transition-colors">
          {t('admin.orders.exportAll')}
        </button>
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-3">
        {filtered.map(order => (
          <div key={order.id} className={`bg-white rounded-lg border-2 overflow-hidden transition-colors ${expandedId === order.id ? 'border-primary-600' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-slate-50" onClick={() => expandOrder(order.id)}>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-bold text-slate-800">{order.orderNumber}</span>
                <span className="text-xs text-slate-500">📦 {order.customerName}</span>
                <span className="text-xs text-slate-500 hidden sm:inline">📞 {order.customerPhone}</span>
                <span className="text-xs text-slate-400 hidden md:inline truncate max-w-[200px]">📍 {order.customerAddress}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 text-sm">
                  {order.items.some(i => i.unitPrice !== undefined)
                    ? `¥ ${order.items.reduce((s, i) => s + (i.unitPrice || 0) * i.quantity, 0).toFixed(2)}`
                    : '¥ --'}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold border ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {order.status === 'pending' ? t('admin.orders.pending') : t('admin.orders.priced')}
                </span>
                <span className="text-slate-400 text-sm">{expandedId === order.id ? '▼' : '▶'}</span>
              </div>
            </div>

            {expandedId === order.id && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
                <div className="bg-yellow-50 rounded-md px-4 py-2.5 text-xs text-yellow-700 mb-4 flex items-center gap-2">
                  💡 {t('admin.orders.pricingHint')}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.product')}</th>
                      <th className="text-left px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.specs')}</th>
                      <th className="text-center px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.quantity')}</th>
                      <th className="text-right px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.unitPrice')}</th>
                      <th className="text-right px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.subtotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => {
                      const inputVal = getPriceInputValue(item, idx);
                      const price = inputVal ? parseFloat(inputVal) : item.unitPrice;
                      const subtotal = price && !isNaN(price) ? price * item.quantity : null;
                      const isUnpriced = !inputVal && item.unitPrice === undefined;
                      return (
                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                          <td className="px-2 py-2.5 font-semibold text-slate-800">{item.productName}</td>
                          <td className="px-2 py-2.5 text-xs text-slate-500">{item.spec}</td>
                          <td className="px-2 py-2.5 text-center font-semibold">{item.quantity}</td>
                          <td className="px-2 py-2.5 text-right">
                            <input
                              value={inputVal}
                              placeholder={t('admin.orders.unpriced')}
                              onChange={e => setPriceInput(idx, e.target.value)}
                              className={`w-20 px-2 py-1.5 text-right border rounded-md text-sm font-semibold outline-none
                                ${isUnpriced ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 focus:border-primary-400'}`}
                            />
                          </td>
                          <td className="px-2 py-2.5 text-right font-bold text-slate-800">{subtotal !== null ? subtotal.toFixed(2) : '--'}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={3}></td>
                      <td className="px-2 py-3 text-right font-bold text-sm">{t('admin.orders.total')}</td>
                      <td className="px-2 py-3 text-right font-extrabold text-base text-primary-600">¥ {orderTotal(order.items).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={savePricing} className="px-4 py-2 text-xs font-semibold text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors">
                    {t('admin.orders.savePricing')}
                  </button>
                  <button onClick={() => exportSingle(order)} className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors">
                    {t('admin.orders.exportSingle')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
