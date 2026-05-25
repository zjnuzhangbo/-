import { useTranslation } from 'react-i18next';

interface Props {
  categories: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect('')}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
          selected === '' ? 'bg-primary text-white shadow-md shadow-primary/25' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        }`}
      >
        {t('home.all')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            selected === cat.id ? 'bg-primary text-white shadow-md shadow-primary/25' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
