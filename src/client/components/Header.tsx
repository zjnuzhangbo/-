import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../shared/services/supabase/client';

const langs = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

interface HeaderProps {
  cartCount?: number;
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path ? 'text-primary-600' : 'text-slate-500 hover:text-slate-800'
    }`;

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-slate-800 no-underline">
          {t('app.name')}
        </Link>
        <nav className="flex items-center gap-4">
          <div className="flex items-center gap-0.5 mr-1">
            {langs.map(l => (
              <button
                key={l.code}
                onClick={() => i18n.changeLanguage(l.code)}
                className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-colors
                  ${i18n.language === l.code
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link to="/" className={linkClass('/')}>{t('nav.home')}</Link>
          <Link to="/history" className={linkClass('/history')}>{t('nav.history')}</Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">{t('auth.loggedInAs', { email: user.email })}</span>
              <button onClick={() => supabase.auth.signOut()} className="text-xs text-slate-400 hover:text-red-500">{t('auth.logout')}</button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-700">登录</Link>
          )}
          <Link to="/order" className="relative">
            <span className="text-lg">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
