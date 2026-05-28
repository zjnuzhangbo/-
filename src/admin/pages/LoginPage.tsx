import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../shared/services';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const ok = await authService.login(account, password);
    if (ok) {
      navigate('/orders');
    } else {
      setError(t('admin.login.error'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 p-10 w-full max-w-sm shadow-sm">
        <div className="text-center mb-8">
          <div className="font-display text-2xl text-slate-800 font-bold mb-1">TricycleParts</div>
          <div className="text-xs text-slate-400">{t('admin.login.title')}</div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">{t('admin.login.account')}</label>
            <input
              className="input-field mt-1"
              placeholder={t('admin.login.accountPlaceholder')}
              value={account}
              onChange={e => setAccount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t('admin.login.password')}</label>
            <input
              type="password"
              className="input-field mt-1"
              placeholder={t('admin.login.passwordPlaceholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={handleLogin} className="w-full py-3 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700 transition-colors text-sm">
            {t('admin.login.submit')}
          </button>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6 pt-4 border-t border-slate-50">
          {t('admin.login.footer')}
        </p>
      </div>
    </div>
  );
}
