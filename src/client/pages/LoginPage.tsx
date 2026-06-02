import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../shared/services/supabase/client';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') || '/';

  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setSending(false);
    if (err) { setError(err.message); return; }
    setCodeSent(true);
  };

  const verifyCode = async () => {
    if (!code.trim()) return;
    setError('');
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    if (err) { setError(err.message); return; }
    navigate(returnTo, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-display text-xl text-slate-800 text-center mb-6">{t('auth.title')}</h1>

        {!codeSent ? (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-500">{t('auth.emailLabel')}</label>
            <input
              className="input-field"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendCode()}
            />
            <button
              onClick={sendCode}
              disabled={sending || !email.trim()}
              className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm"
            >
              {sending ? t('auth.sending') : t('auth.sendCode')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-emerald-600 text-center">{t('auth.codeSent')}</p>
            <label className="text-xs font-semibold text-slate-500">{t('auth.codeLabel')}</label>
            <input
              className="input-field text-center text-lg tracking-widest"
              placeholder={t('auth.codePlaceholder')}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && verifyCode()}
            />
            <button
              onClick={verifyCode}
              disabled={code.length < 6}
              className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm"
            >
              {t('auth.verify')}
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-3 text-center">{error}</p>}

        <button onClick={() => navigate(-1)} className="w-full mt-4 text-xs text-slate-400 hover:text-slate-600">
          ← {t('order.back')}
        </button>
      </div>
    </div>
  );
}
