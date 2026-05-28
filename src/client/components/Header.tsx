import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  cartCount?: number;
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path ? 'text-primary-600' : 'text-slate-500 hover:text-slate-800'
    }`;

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-slate-800 no-underline">
          TricycleParts
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className={linkClass('/')}>{t('nav.home')}</Link>
          <Link to="/history" className={linkClass('/history')}>{t('nav.history')}</Link>
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
