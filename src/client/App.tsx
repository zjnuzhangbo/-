import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../shared/components/ui/Toast';
import '../shared/i18n';
import { seedIfEmpty } from '../shared/services/seed';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthGuard from './components/AuthGuard';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import OrderHistory from './pages/OrderHistory';
import LoginPage from './pages/LoginPage';

export default function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      import('../shared/services/seed').then(m => m.seedIfEmpty());
    }
  }, []);

  return (
    <ToastProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/order" element={<AuthGuard><OrderPage /></AuthGuard>} />
              <Route path="/history" element={<AuthGuard><OrderHistory /></AuthGuard>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </ToastProvider>
  );
}
