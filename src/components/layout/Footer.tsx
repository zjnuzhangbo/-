import { useCompanyStore } from '../../stores/useCompanyStore';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const company = useCompanyStore((s) => s.company);
  const lang = i18n.language as 'zh' | 'en' | 'ru';

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-800">{company.name[lang]}</h3>
            {company.phone && <p className="text-sm text-gray-500 mt-1">{company.phone}</p>}
          </div>
          {company.wechatQR && (
            <div className="text-center">
              <img src={company.wechatQR} alt="WeChat QR" className="w-20 h-20 mx-auto rounded-lg border" />
              <p className="text-xs text-gray-400 mt-1">WeChat</p>
            </div>
          )}
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {company.name[lang]}. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
