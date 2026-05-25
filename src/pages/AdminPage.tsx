import { useAuthStore } from '../stores/useAuthStore';
import LoginForm from '../components/admin/LoginForm';
import AdminPanel from '../components/admin/AdminPanel';

export default function AdminPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? <AdminPanel /> : <LoginForm />;
}
