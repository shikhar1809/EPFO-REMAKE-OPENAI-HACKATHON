import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type RiskLevel = 'low' | 'medium' | 'high';

interface SessionState {
  isAuthenticated: boolean;
  user: {
    uan?: string;
    phone?: string;
    name?: string;
  } | null;
  hasCompletedProfile: boolean;
  sessionId: string | null;
  riskLevel: RiskLevel;
  deviceContext: string;
  
  // Actions
  loginWithPhone: (phone: string, otp: string) => Promise<boolean>;
  verifyUAN: (uan: string) => Promise<boolean>;
  logout: () => void;
  completeProfile: (data: { uan?: string; name: string }) => void;
  stepUpAuth: (otp: string) => Promise<boolean>;
  setRiskLevel: (level: RiskLevel) => void;
}

const generateId = () => crypto.randomUUID();

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      hasCompletedProfile: false,
      sessionId: null,
      riskLevel: 'low',
      deviceContext: navigator.userAgent,

      loginWithPhone: async (phone, otp) => {
        await new Promise(r => setTimeout(r, 1000));
        if (otp === '1234') { // Mock OTP
          const sid = generateId();
          set({ 
            isAuthenticated: true, 
            user: { phone }, 
            sessionId: sid,
            riskLevel: 'low'
          });
          return true;
        }
        return false;
      },

      verifyUAN: async (uan) => {
        await new Promise(r => setTimeout(r, 1000));
        if (uan.length === 12) {
          const sid = generateId();
          set(state => ({
            isAuthenticated: true,
            sessionId: sid,
            user: { ...state.user, uan }
          }));
          return true;
        }
        return false;
      },

      logout: () => set({ 
        isAuthenticated: false, 
        user: null, 
        sessionId: null,
        riskLevel: 'low'
      }),

      completeProfile: (data) => set(state => ({ 
        hasCompletedProfile: true,
        user: { ...state.user, ...data }
      })),

      stepUpAuth: async (otp) => {
        await new Promise(r => setTimeout(r, 500));
        if (otp === '1234') {
          set({ riskLevel: 'low' });
          return true;
        }
        return false;
      },

      setRiskLevel: (level) => set({ riskLevel: level }),
    }),
    {
      name: 'epfo-secure-session',
      partialize: (state) => ({ 
        hasCompletedProfile: state.hasCompletedProfile,
        sessionId: state.sessionId,
        user: state.user
      }),
    }
  )
);
