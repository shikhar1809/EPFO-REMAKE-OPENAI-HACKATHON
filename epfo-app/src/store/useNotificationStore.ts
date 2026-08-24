import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationState {
  enabled: boolean;
  email: string;
  whatsapp: string;
  notifyDeadlines: boolean;
  notifyClaimUpdates: boolean;
  notifyMonthlyCredits: boolean;
  consentGiven: boolean;
  consentTimestamp: string | null;

  // Actions
  updateSettings: (settings: Partial<Omit<NotificationState, 'updateSettings' | 'giveConsent' | 'revokeConsent' | 'toggleNotifications'>>) => void;
  toggleNotifications: (enabled: boolean) => void;
  giveConsent: () => void;
  revokeConsent: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      enabled: true,
      email: 'rameshwar.sharma@example.com',
      whatsapp: '+91 98765 43210',
      notifyDeadlines: true,
      notifyClaimUpdates: true,
      notifyMonthlyCredits: true,
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),

      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      
      toggleNotifications: (enabled) => set({ enabled }),

      giveConsent: () => set({
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
        enabled: true
      }),

      revokeConsent: () => set({
        consentGiven: false,
        consentTimestamp: null,
        enabled: false
      })
    }),
    {
      name: 'epfo-notifications'
    }
  )
);
