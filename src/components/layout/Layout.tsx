import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ToastContainer from '../ui/Toast';
import { useProductStore } from '../../stores/useProductStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useCartStore } from '../../stores/useCartStore';
import { useInvoiceStore } from '../../stores/useInvoiceStore';
import { useCompanyStore } from '../../stores/useCompanyStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../lib/supabase';

export default function Layout() {
  const loadSession = useAuthStore((s) => s.loadSession);
  const loadProducts = useProductStore((s) => s.load);
  const loadCategories = useCategoryStore((s) => s.load);
  const loadCart = useCartStore((s) => s.load);
  const loadInvoices = useInvoiceStore((s) => s.load);
  const loadCompany = useCompanyStore((s) => s.load);

  useEffect(() => {
    loadSession();
    loadProducts();
    loadCategories();
    loadCart();
    loadInvoices();
    loadCompany();

    const cleanupRealtime = useInvoiceStore.getState().initRealtime();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ isLoggedIn: false, userEmail: null });
      } else if (event === 'SIGNED_IN' && session?.user) {
        useAuthStore.setState({ isLoggedIn: true, userEmail: session.user.email || null });
      }
    });

    return () => {
      subscription.unsubscribe();
      cleanupRealtime();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
