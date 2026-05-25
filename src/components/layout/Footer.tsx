import { useCompanyStore } from '../../stores/useCompanyStore';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const company = useCompanyStore((s) => s.company);
  const lang = i18n.language as 'zh' | 'en' | 'ru';

  return (
    <footer className="border-t border-gray-100/80 bg-white/40 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-800">{company.name[lang]}</h3>
            {company.phone && (
              <p className="text-sm text-gray-500 mt-1.5 flex items-center justify-center md:justify-start gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {company.phone}
              </p>
            )}
          </div>

          <div className="flex items-center gap-8">
            {company.wechatQR && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white p-1">
                  <img src={company.wechatQR} alt="WeChat QR" className="w-full h-full object-contain rounded-xl" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">WeChat</p>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center md:text-right">
            &copy; {new Date().getFullYear()} {company.name[lang]}
            <span className="mx-1.5 text-gray-300">·</span>
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
