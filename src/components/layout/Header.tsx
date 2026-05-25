import { useState } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = totalCount();

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

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold text-primary tracking-tight flex-shrink-0">
          <span className="bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">TricycleParts</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:flex rounded-full border border-gray-200/80 bg-white/50 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLang(lang.code)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  currentLang === lang.code
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {browserSupportsSpeechRecognition && (
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative p-2 rounded-full transition-all duration-300 ${
                listening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                  : 'text-gray-500 hover:text-primary hover:bg-primary-50'
              }`}
              title={listening ? 'Listening...' : 'Voice control'}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              {listening && <span className="absolute inset-0 rounded-full animate-ping bg-red-400/30" />}
            </button>
          )}

          <Link to="/order" className="relative p-2 text-gray-500 hover:text-primary transition-colors">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-accent text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg shadow-accent/30 animate-in">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-primary transition-colors"
          >
            {mobileOpen ? (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl animate-in">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMobile}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-4 flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLang(lang.code)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentLang === lang.code ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
