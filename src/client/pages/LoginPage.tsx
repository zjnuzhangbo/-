import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../shared/services/supabase/client';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') || '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(returnTo, { replace: true });
    });
  }, []);

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
    if (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError(t('auth.wrongCredentials'));
      } else {
        setError(err.message);
      }
      return;
    }
    navigate(returnTo, { replace: true });
  };

  const handlePhoneLogin = async () => {
    setError('');
    if (!phone.trim() || !password.trim()) { setError(t('auth.fillAll')); return; }
    if (password.length < 6) { setError(t('auth.passwordShort')); return; }
    setLoading(true);
    const fakeEmail = `${phone.trim()}@phone.tricycle`;
    // Try login, auto-register on failure
    let { data, error: err } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });
    if (err) {
      const { data: signupData, error: signupErr } = await supabase.auth.signUp({ email: fakeEmail, password });
      if (signupErr) { setLoading(false); setError(signupErr.message); return; }
      if (signupData.session) { setLoading(false); navigate(returnTo, { replace: true }); return; }
      data = signupData;
    }
    setLoading(false);
    if (data?.session) { navigate(returnTo, { replace: true }); }
    else if (err) { setError(err.message); }
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
    setTimeout(() => navigate(returnTo, { replace: true }), 500);
  };

  const tabs = [
    { key: 'email' as const, label: t('auth.emailLogin') },
    { key: 'phone' as const, label: t('auth.phoneLogin') },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-xl">
        <h1 className="font-display text-2xl text-slate-800 text-center mb-6">{t('auth.title')}</h1>

        {mode !== 'register' && (
          <div className="flex rounded-lg overflow-hidden border border-slate-200 mb-5">
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
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm transition-all shadow-lg shadow-primary-200 mt-1">
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
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm transition-all shadow-lg shadow-primary-200 mt-1">
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
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 text-sm transition-all shadow-lg shadow-emerald-200 mt-1">
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

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-600 text-center">{error}</p>
          </div>
        )}
        {message && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <p className="text-xs text-emerald-600 text-center">{message}</p>
          </div>
        )}

        <button onClick={() => navigate(-1)} className="w-full mt-5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          ← {t('order.back')}
        </button>
      </div>
    </div>
  );
}
