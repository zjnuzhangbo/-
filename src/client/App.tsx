import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../shared/components/ui/Toast';
import '../shared/i18n';
import { seedIfEmpty } from '../shared/services/seed';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import OrderHistory from './pages/OrderHistory';

export default function App() {
  useEffect(() => { seedIfEmpty(); }, []);

  return (
    <ToastProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/history" element={<OrderHistory />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </ToastProvider>
  );
}
