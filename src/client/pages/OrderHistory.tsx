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
    <div className="max-w-3xl mx-auto px-4 py-6 flex-1">
      <h1 className="font-display text-2xl text-slate-800 mb-1">{t('history.title')}</h1>
      <p className="text-xs text-slate-400 mb-4">{t('history.count', { count: orders.length })}</p>

      <div className="flex gap-2 mb-5">
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
        <div className="flex flex-col gap-3">
          {filtered.map(order => {
            const locked = isLocked(order);
            return (
              <div key={order.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800">订单 #{order.orderNumber}</span>
                    <span className="text-xs text-slate-400 ml-3">{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold border
                    ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {order.status === 'pending' ? t('history.pending') : t('history.priced')}
                  </span>
                </div>

                <div className="px-5 py-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2">
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{item.productName}</span>
                        <span className="text-xs text-slate-400 ml-2">{item.spec}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">×</span>
                        {locked ? (
                          <span className="font-semibold text-sm w-8 text-center">{item.quantity}</span>
                        ) : (
                          <input
                            type="number"
                            min={1}
                            defaultValue={item.quantity}
                            onChange={e => saveQuantity(order, idx, parseInt(e.target.value) || 1)}
                            className="w-12 px-1 py-1 text-center border border-slate-200 rounded-md text-sm font-semibold outline-none focus:border-primary-400"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="bg-slate-50 rounded-md px-3 py-2 mt-2 text-xs text-slate-500 flex gap-4">
                    <span>📦 {order.customerName}</span>
                    <span>📞 {order.customerPhone}</span>
                    <span className="truncate">📍 {order.customerAddress}</span>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
                  {locked ? (
                    <div className="bg-yellow-50 rounded-md px-3 py-1.5 text-xs text-yellow-700">🔒 {t('history.locked')}</div>
                  ) : (
                    <button onClick={() => setDeleteId(order.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
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
