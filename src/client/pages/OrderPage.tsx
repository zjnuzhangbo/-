import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../shared/components/ui/Toast';
import { orderService } from '../../shared/services';
import { getShippingMemory, setShippingMemory } from '../../shared/services/localStorage';
import type { OrderItem } from '../../shared/types';
import ProductPickerModal from '../components/ProductPickerModal';

interface CartItem extends OrderItem {}

export default function OrderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const savedShipping = getShippingMemory();

  const [name, setName] = useState(savedShipping?.name || '');
  const [phone, setPhone] = useState(savedShipping?.phone || '');
  const [address, setAddress] = useState(savedShipping?.address || '');
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('tricycle_cart') || '[]'); }
    catch { return []; }
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateQuantity = (idx: number, delta: number) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('order.validation.name');
    if (!phone.trim()) newErrors.phone = t('order.validation.phone');
    if (!address.trim()) newErrors.address = t('order.validation.address');
    if (items.length === 0) newErrors.empty = t('order.validation.empty');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setShippingMemory({ name, phone, address });

    const now = new Date();
    const orderNumber = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    await orderService.create({
      id: crypto.randomUUID(),
      orderNumber,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      items: items.map(i => ({ ...i, unitPrice: undefined })),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    localStorage.removeItem('tricycle_cart');
    toast(t('order.submitSuccess'));
    navigate('/history');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex-1">
      <Link to="/" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">{t('order.back')}</Link>
      <h1 className="font-display text-2xl text-slate-800 mt-2 mb-6">{t('order.title')}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Shipping info */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="font-display text-lg text-slate-800 mb-4">{t('order.shippingInfo')}</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('order.name')}</label>
              <input className="input-field mt-1" placeholder={t('order.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('order.phone')}</label>
              <input className="input-field mt-1" placeholder={t('order.phonePlaceholder')} value={phone} onChange={e => setPhone(e.target.value)} />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('order.address')}</label>
              <textarea className="input-field mt-1" rows={3} placeholder={t('order.addressPlaceholder')} value={address} onChange={e => setAddress(e.target.value)} />
              {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
            </div>
          </div>
        </div>

        {/* Product list */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="font-display text-lg text-slate-800 mb-4">{t('order.productList')}</h2>
          {errors.empty && <span className="text-xs text-red-500">{errors.empty}</span>}
          {items.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">暂无已选商品</p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.productName}</p>
                    <p className="text-xs text-slate-400">{item.spec}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(idx, -1)} className="w-7 h-7 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm">−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(idx, 1)} className="w-7 h-7 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm">+</button>
                    <button onClick={() => removeItem(idx)} className="ml-2 text-red-400 hover:text-red-600 text-sm">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setPickerOpen(true)} className="mt-4 text-sm text-primary-600 font-semibold hover:text-primary-700">
            {t('order.addProduct')}
          </button>
        </div>
      </div>

      <button onClick={handleSubmit} className="w-full mt-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors text-sm">
        {t('order.submit')}
      </button>

      <ProductPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={addItem} />
    </div>
  );
}
