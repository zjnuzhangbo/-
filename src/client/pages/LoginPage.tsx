import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../shared/services/supabase/client';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') || '/';

  const [mode, setMode] = useState<'email' | 'phone' | 'register'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError(t('auth.fillAll')); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    navigate(returnTo, { replace: true });
  };

  const handlePhoneLogin = async () => {
    setError('');
    if (!phone.trim() || !password.trim()) { setError(t('auth.fillAll')); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: `${phone.trim()}@phone.tricycle`, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    navigate(returnTo, { replace: true });
  };

  const handleRegister = async () => {
    setError('');
    setMessage('');
    if (!email.trim() || !password.trim()) { setError(t('auth.fillAll')); return; }
    if (password.length < 6) { setError(t('auth.passwordShort')); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin + '/#/login' },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setMessage(t('auth.registerSuccess'));
    setMode('email');
  };

  const tabs = [
    { key: 'email' as const, label: t('auth.emailLogin') },
    { key: 'phone' as const, label: t('auth.phoneLogin') },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-display text-xl text-slate-800 text-center mb-1">{t('auth.title')}</h1>

        {mode !== 'register' && (
          <div className="flex rounded-md overflow-hidden border border-slate-200 mt-4 mb-5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setMode(tab.key); setError(''); setMessage(''); }}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${mode === tab.key ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {mode === 'email' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('auth.emailLabel')}</label>
              <input className="input-field mt-1" type="email" placeholder={t('auth.emailPlaceholder')}
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('auth.passwordLabel')}</label>
              <input className="input-field mt-1" type="password" placeholder={t('auth.passwordPlaceholder')}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmailLogin()} />
            </div>
            <button onClick={handleEmailLogin} disabled={loading}
              className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm">
              {t('auth.login')}
            </button>
            <p className="text-center text-xs text-slate-400">
              {t('auth.noAccount')}{' '}
              <button onClick={() => { setMode('register'); setError(''); setMessage(''); }} className="text-primary-600 font-semibold hover:underline">
                {t('auth.register')}
              </button>
            </p>
          </div>
        )}

        {mode === 'phone' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('auth.phoneLabel')}</label>
              <input className="input-field mt-1" type="tel" placeholder={t('auth.phonePlaceholder')}
                value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('auth.passwordLabel')}</label>
              <input className="input-field mt-1" type="password" placeholder={t('auth.passwordPlaceholder')}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePhoneLogin()} />
            </div>
            <button onClick={handlePhoneLogin} disabled={loading}
              className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm">
              {t('auth.login')}
            </button>
            <p className="text-center text-xs text-slate-400">
              {t('auth.phoneHint')}
            </p>
          </div>
        )}

        {mode === 'register' && (
          <div className="flex flex-col gap-3 mt-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('auth.emailLabel')}</label>
              <input className="input-field mt-1" type="email" placeholder={t('auth.emailPlaceholder')}
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('auth.passwordLabel')}</label>
              <input className="input-field mt-1" type="password" placeholder={t('auth.passwordPlaceholder')}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()} />
            </div>
            <button onClick={handleRegister} disabled={loading}
              className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 disabled:opacity-50 text-sm">
              {t('auth.register')}
            </button>
            <p className="text-center text-xs text-slate-400">
              {t('auth.hasAccount')}{' '}
              <button onClick={() => { setMode('email'); setError(''); }} className="text-primary-600 font-semibold hover:underline">
                {t('auth.login')}
              </button>
            </p>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-3 text-center">{error}</p>}
        {message && <p className="text-xs text-emerald-600 mt-3 text-center">{message}</p>}

        <button onClick={() => navigate(-1)} className="w-full mt-4 text-xs text-slate-400 hover:text-slate-600">
          ← {t('order.back')}
        </button>
      </div>
    </div>
  );
}
