import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { exportExcel } from '../../utils/exportExcel';
import { exportWord } from '../../utils/exportWord';
import type { InvoiceItem } from '../../types';

interface Props {
  invoiceData: InvoiceItem[];
  totalAmount: number;
  customerName: string;
  onExport: () => void;
}

export default function ExportButtons({ invoiceData, totalAmount, customerName, onExport }: Props) {
  const { t } = useTranslation();

  const handleExcel = () => {
    exportExcel(invoiceData, totalAmount, customerName || 'customer');
    onExport();
  };

  const handleWord = () => {
    exportWord(invoiceData, totalAmount, customerName || 'customer');
    onExport();
  };

  return (
    <>
      <Button variant="secondary" onClick={handleExcel}>
        {t('invoice.exportExcel')}
      </Button>
      <Button onClick={handleWord}>
        {t('invoice.exportWord')}
      </Button>
    </>
  );
}
