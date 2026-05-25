import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import ProductManager from './ProductManager';
import CategoryManager from './CategoryManager';
import CompanyEditor from './CompanyEditor';
import OrderHistory from './OrderHistory';
import Button from '../ui/Button';

const tabs = ['products', 'categories', 'company', 'history'] as const;

export default function AdminPanel() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('products');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
        <Button variant="ghost" onClick={logout}>{t('admin.logout')}</Button>
      </div>
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t(`admin.${tab}`)}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'company' && <CompanyEditor />}
        {activeTab === 'history' && <OrderHistory />}
      </div>
    </div>
  );
}
