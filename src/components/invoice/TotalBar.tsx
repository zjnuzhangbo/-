import { useTranslation } from 'react-i18next';

interface Props {
  total: number;
}

export default function TotalBar({ total }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-end items-center gap-4 py-4 px-6 bg-primary-50 rounded-xl">
      <span className="text-sm font-medium text-gray-600">{t('invoice.total')}</span>
      <span className="text-2xl font-bold text-primary">¥{total.toFixed(2)}</span>
    </div>
  );
}
