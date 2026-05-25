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

export default function Layout() {
  const loadProducts = useProductStore((s) => s.load);
  const loadCategories = useCategoryStore((s) => s.load);
  const loadCart = useCartStore((s) => s.load);
  const loadInvoices = useInvoiceStore((s) => s.load);
  const loadCompany = useCompanyStore((s) => s.load);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadCart();
    loadInvoices();
    loadCompany();
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
