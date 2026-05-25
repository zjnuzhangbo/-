import { useTranslation } from 'react-i18next';

interface Props {
  categories: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
      <button
        onClick={() => onSelect('')}
        className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
          selected === ''
            ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
            : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200/80'
        }`}
      >
        {t('home.all')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
            selected === cat.id
              ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
              : 'bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200/80'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
