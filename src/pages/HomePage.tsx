import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductStore } from '../stores/useProductStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import SearchBar from '../components/product/SearchBar';
import CategoryFilter from '../components/product/CategoryFilter';
import ProductGrid from '../components/product/ProductGrid';

export default function HomePage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en' | 'ru';
  const { products, load: loadProducts } = useProductStore();
  const { categories, load: loadCategories } = useCategoryStore();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = !selectedCat || p.categoryId === selectedCat;
      const matchSearch = !search || p.name[lang].toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCat, search, lang]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-5 pt-12 pb-6">
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {lang === 'zh' ? '三轮车配件' : lang === 'en' ? 'Tricycle Parts' : 'Запчасти для трициклов'}
          </h1>
          <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-md mx-auto">
            {lang === 'zh'
              ? '高品质配件，一站式采购'
              : lang === 'en'
              ? 'High-quality parts, one-stop sourcing'
              : 'Качественные запчасти в одном месте'}
          </p>
        </div>

        <div className="animate-fade-up animate-fade-up-delay-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="mt-5 animate-fade-up animate-fade-up-delay-2">
          <CategoryFilter
            categories={categories.map((c) => ({ id: c.id, name: c.name[lang] }))}
            selected={selectedCat}
            onSelect={setSelectedCat}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 pb-16 animate-fade-up animate-fade-up-delay-3">
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}
