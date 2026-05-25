import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  userEmail: string | null;
  loadSession: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isLoading: true,
  userEmail: null,

  loadSession: () => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({
          isLoggedIn: true,
          isLoading: false,
          userEmail: session.user.email || null,
        });
      } else {
        set({ isLoading: false });
      }
    })();
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.user) {
      set({ isLoggedIn: true, userEmail: data.user.email || null });
      return true;
    }
    return false;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isLoggedIn: false, userEmail: null });
  },

  changePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },
}));
