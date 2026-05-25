import type { Product } from '../../types';
import { useCategoryStore } from '../../stores/useCategoryStore';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
}

export default function ProductGrid({ products }: Props) {
  const categories = useCategoryStore((s) => s.categories);

  const getCategoryName = (categoryId: string, lang: 'zh' | 'en' | 'ru' = 'zh') => {
    return categories.find((c) => c.id === categoryId)?.name[lang] || categoryId;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <span className="text-5xl block mb-4">🔍</span>
        <p className="text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} categoryName={getCategoryName(p.categoryId)} />
      ))}
    </div>
  );
}
