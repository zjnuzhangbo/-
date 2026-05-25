import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../stores/useCartStore';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import type { Language } from '../../types';

const languages: { code: Language; label: string }[] = [
  { code: 'zh', label: '中' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const totalCount = useCartStore((s) => s.totalCount);

  const switchLang = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('tricycle_lang', lang);
  };

  const currentLang = i18n.language as Language;

  const { listening, browserSupportsSpeechRecognition, startListening, stopListening } = useVoiceCommands();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/order', label: t('nav.order') },
    { to: '/orders', label: t('nav.orders') },
    { to: '/admin', label: t('nav.admin') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">
          TricycleParts
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLang(lang.code)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  currentLang === lang.code ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          {browserSupportsSpeechRecognition && (
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative p-2 rounded-full transition-all duration-200 ${
                listening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-accent hover:text-white'
              }`}
              title={listening ? 'Listening...' : 'Voice control'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              {listening && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          )}
          <Link to="/order" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {totalCount()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
