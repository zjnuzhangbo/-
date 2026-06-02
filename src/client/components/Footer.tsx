import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-800 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p className="font-display text-white text-base mb-1">{t('app.companyName')}</p>
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
