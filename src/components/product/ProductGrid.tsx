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
      <div className="text-center py-24 text-gray-400">
        <span className="text-6xl block mb-5 opacity-40">🔍</span>
        <p className="text-sm font-medium">No products found</p>
        <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((p, i) => (
        <div
          key={p.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
        >
          <ProductCard product={p} categoryName={getCategoryName(p.categoryId)} />
        </div>
      ))}
    </div>
  );
}
