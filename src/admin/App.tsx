import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../shared/components/ui/Toast';
import '../shared/i18n';
import { authService } from '../shared/services';
import { hasAdminToken } from '../shared/services/supabase/adminApi';
import { seedIfEmpty } from '../shared/services/seed';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import ProductManager from './pages/ProductManager';
import OrderManager from './pages/OrderManager';

const useSupabase = !!import.meta.env.VITE_SUPABASE_URL;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authed = useSupabase ? hasAdminToken() : authService.isLoggedIn();
  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      import('../shared/services/seed').then(m => m.seedIfEmpty());
    }
  }, []);

  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/orders" element={
            <ProtectedRoute><AdminLayout><OrderManager /></AdminLayout></ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute><AdminLayout><ProductManager /></AdminLayout></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}
