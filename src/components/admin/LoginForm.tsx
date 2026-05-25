import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from '../ui/Toast';

export default function LoginForm() {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const ok = await login(email, password);
      if (ok) {
        toast(t('common.success'), 'success');
      } else {
        setError(t('admin.wrongPassword'));
      }
    } catch {
      setError(t('admin.wrongPassword'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('admin.login')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="Email"
            autoComplete="email"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder={t('admin.password')}
            error={error}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? '...' : t('admin.loginBtn')}
          </Button>
        </form>
      </div>
    </div>
  );
}
