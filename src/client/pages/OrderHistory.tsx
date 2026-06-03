import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../shared/services';
import type { Order, OrderStatus } from '../../shared/types';
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog';
import { useToast } from '../../shared/components/ui/Toast';

export default function OrderHistory() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => { orderService.getAll().then(setOrders); };
  useEffect(load, []);

  const HOURS_24 = 24 * 60 * 60 * 1000;

  const isLocked = (order: Order) => {
    if (order.status === 'priced') return true;
    return Date.now() - new Date(order.createdAt).getTime() > HOURS_24;
  };

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const saveQuantity = async (order: Order, idx: number, qty: number) => {
    const items = [...order.items];
    items[idx] = { ...items[idx], quantity: Math.max(1, qty) };
    await orderService.update(order.id, { items });
    toast('数量已更新');
    load();
  };

  const deleteOrder = async () => {
    if (!deleteId) return;
    try {
      await orderService.remove(deleteId);
      toast('订单已删除');
      load();
    } catch {
      toast('删除失败，请重试');
    }
    setDeleteId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex-1">
      <h1 className="font-display text-2xl text-slate-800 mb-1">{t('history.title')}</h1>
      <p className="text-sm text-slate-400 mb-5">{t('history.count', { count: orders.length })}</p>

      <div className="sticky top-[56px] z-20 bg-slate-50 pt-2 pb-3 -mx-4 px-4 md:-mx-6 md:px-6 flex gap-2">
        {(['all', 'pending', 'priced'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors
              ${filter === s ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
          >
            {s === 'all' ? t('history.filterAll') : s === 'pending' ? t('history.filterPending') : t('history.filterPriced')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-3">📋</span>
          <p className="text-slate-500 font-medium">{t('history.empty')}</p>
          <p className="text-slate-400 text-sm mt-1">{t('history.emptyHint')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(order => {
            const locked = isLocked(order);
            return (
              <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                {/* Header */}
                <div className="flex justify-between items-center px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800 text-sm">#{order.orderNumber}</span>
                    <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-xs font-semibold
                    ${order.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {order.status === 'pending' ? '○ ' : '● '}
                    {order.status === 'pending' ? t('history.pending') : t('history.priced')}
                  </span>
                </div>

                {/* Body */}
                <div className="px-5 py-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-slate-400 font-semibold">{item.productName.slice(0,1)}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 text-sm block truncate">{item.productName}</span>
                          <span className="text-xs text-slate-400">{item.spec}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-400">×</span>
                        {locked ? (
                          <span className="font-semibold text-sm w-8 text-center">{item.quantity}</span>
                        ) : (
                          <input
                            type="number"
                            min={1}
                            defaultValue={item.quantity}
                            onChange={e => saveQuantity(order, idx, parseInt(e.target.value) || 1)}
                            className="w-14 px-2 py-1.5 text-center border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Shipping info */}
                  <div className="bg-slate-50 rounded-lg px-4 py-2.5 mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                    <span>📦 {order.customerName}</span>
                    <span>📞 {order.customerPhone}</span>
                    <span className="truncate">📍 {order.customerAddress}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
                  {locked ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                      🔒 {t('history.locked')}
                    </span>
                  ) : (
                    <button onClick={() => setDeleteId(order.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                      {t('history.delete')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteOrder}
        title={t('history.delete')}
        message={t('history.deleteConfirm')}
      />
    </div>
  );
}
