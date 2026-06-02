import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../shared/services/supabase/client';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuthed(true);
      } else {
        navigate(`/login?return=${encodeURIComponent(location.pathname)}`, { replace: true });
      }
      setChecking(false);
    });
  }, []);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center"><span className="text-slate-400 text-sm">Loading...</span></div>;
  }

  if (!authed) return null;
  return <>{children}</>;
}
