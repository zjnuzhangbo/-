import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '../stores/useProductStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { useCartStore } from '../stores/useCartStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { toast } from '../components/ui/Toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en' | 'ru';
  const product = useProductStore((s) => s.getById(id || ''));
  const category = useCategoryStore((s) => s.categories.find((c) => c.id === product?.categoryId));
  const addItem = useCartStore((s) => s.addItem);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <span className="text-5xl block mb-4">🔍</span>
        <p>Product not found</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">Back to Home</Button>
      </div>
    );
  }

  const handleAdd = (variantId: string) => {
    addItem(product.id, variantId);
    toast(t('common.success'), 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-primary mb-6 flex items-center gap-1">
        &larr; Back
      </button>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-50 rounded-card overflow-hidden">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name[lang]} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>
          )}
        </div>
        <div>
          <Badge variant="primary">{category?.name[lang] || ''}</Badge>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.name[lang]}</h1>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">{product.description[lang]}</p>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('product.model')}</h3>
            <div className="space-y-2">
              {product.variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <span className="font-medium text-sm">{v.model}</span>
                    <span className="text-gray-400 text-xs ml-3">{v.size} / {v.weight}</span>
                  </div>
                    <Button size="sm" onClick={() => handleAdd(v.id)}>
                      {t('product.addToCart')}
                    </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
