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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <SearchBar value={search} onChange={setSearch} />
      <CategoryFilter
        categories={categories.map((c) => ({ id: c.id, name: c.name[lang] }))}
        selected={selectedCat}
        onSelect={setSelectedCat}
      />
      <ProductGrid products={filtered} />
    </div>
  );
}
