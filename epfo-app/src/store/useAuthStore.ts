import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: { email: string; sessionId?: string } | null;
  hasCompletedProfile: boolean;
  sessionId: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  completeProfile: () => void;
  setSessionId: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      hasCompletedProfile: false,
      sessionId: null,
      login: async (email, pass) => {
        await new Promise(r => setTimeout(r, 1000));
        if (email === 'admin@epfo' && pass === 'admin123') {
          const sid = generateId();
          set({ isAuthenticated: true, user: { email, sessionId: sid }, sessionId: sid });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, user: null }),
      completeProfile: () => set({ hasCompletedProfile: true }),
      setSessionId: (id) => set({ sessionId: id }),
    }),
    {
      name: 'epfo-auth-storage',
      partialize: (state) => ({ 
        hasCompletedProfile: state.hasCompletedProfile,
        sessionId: state.sessionId 
      }),
    }
  )
);
