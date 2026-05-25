import { useAuthStore } from '../stores/useAuthStore';
import LoginForm from '../components/admin/LoginForm';
import AdminPanel from '../components/admin/AdminPanel';

export default function AdminPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isLoggedIn ? <AdminPanel /> : <LoginForm />;
}
