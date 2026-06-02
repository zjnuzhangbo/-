import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../shared/services';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-800 px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg text-white font-bold">{t('admin.login.title')}</span>
          <span className="text-slate-600 text-xs">|</span>
          <NavLink to="/orders" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
            {t('admin.navbar.orders')}
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
            {t('admin.navbar.products')}
          </NavLink>
        </div>
        <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-white border border-slate-600 rounded-md px-3 py-1.5 transition-colors">
          {t('admin.navbar.logout')}
        </button>
      </header>
      <main className="flex-1 bg-slate-50">{children}</main>
    </div>
  );
}
