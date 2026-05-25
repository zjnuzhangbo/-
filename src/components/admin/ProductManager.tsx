import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '../../stores/useProductStore';
import type { Product } from '../../types';
import Button from '../ui/Button';
import ProductForm from './ProductForm';

export default function ProductManager() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en' | 'ru';
  const { products, add, update, remove } = useProductStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const handleSave = (product: Product) => {
    if (editing) {
      update(product.id, product);
    } else {
      add(product);
    }
    setEditing(null);
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.delete') + '?')) remove(id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t('admin.products')}</h3>
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>+ {t('admin.addProduct')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">{t('admin.name')}</th>
              <th className="text-left py-2 text-gray-500 font-medium">{t('admin.category')}</th>
              <th className="text-left py-2 text-gray-500 font-medium">{t('admin.variants')}</th>
              <th className="text-right py-2 text-gray-500 font-medium">{t('common.edit')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="py-2 font-medium">{p.name[lang]}</td>
                <td className="py-2 text-gray-500">{p.categoryId}</td>
                <td className="py-2 text-gray-500">{p.variants.length}</td>
                <td className="py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}>{t('common.edit')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="text-red-500">{t('common.delete')}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProductForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} initial={editing} />
    </div>
  );
}
