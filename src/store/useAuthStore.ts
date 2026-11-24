import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginByLogin } from '../api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  login: (loginValue: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      error: null,
      isLoading: false,

      login: async (loginValue) => {
        set({ isLoading: true, error: null });
        try {
          const user = await loginByLogin(loginValue);
          set({ user, isLoading: false });
          return true;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Ошибка авторизации';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => set({ user: null, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);