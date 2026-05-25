import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (newPassword: string) => void;
}

const PASSWORD_KEY = 'tricycle_admin_password';

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: sessionStorage.getItem('tricycle_admin_session') === 'true',
  login: (password) => {
    const stored = localStorage.getItem(PASSWORD_KEY) || '123456789';
    if (password === stored) {
      sessionStorage.setItem('tricycle_admin_session', 'true');
      set({ isLoggedIn: true });
      return true;
    }
    return false;
  },
  logout: () => {
    sessionStorage.removeItem('tricycle_admin_session');
    set({ isLoggedIn: false });
  },
  changePassword: (newPassword) => {
    localStorage.setItem(PASSWORD_KEY, newPassword);
  },
}));
