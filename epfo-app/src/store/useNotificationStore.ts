import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationCategory = 'deadlines' | 'claims' | 'contributions' | 'alerts';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  date: string;
  read: boolean;
  actionPath?: string;
  actionLabel?: string;
  icon: string;
  color: string;
}

export const NOTIFICATION_CATEGORIES: Record<NotificationCategory, { label: string; color: string; bg: string }> = {
  deadlines: { label: 'Deadlines', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  claims: { label: 'Claims & Transfers', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  contributions: { label: 'Contributions', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  alerts: { label: 'Alerts & Issues', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'kyc-deadline',
    title: 'KYC Annual Deadline',
    body: 'Last date for Aadhaar-Bank seeding verification is 30 Sep 2026. Ensure all documents are updated to avoid claim rejection.',
    category: 'deadlines',
    date: '2026-09-30',
    read: false,
    actionPath: '/documents',
    actionLabel: 'Check Vault Status',
    icon: 'ShieldCheck',
    color: 'blue',
  },
  {
    id: 'life-cert',
    title: 'Life Certificate Due',
    body: 'Your annual Digital Life Certificate is due by 30 Nov 2026. Submit early via Face Auth to avoid pension interruption.',
    category: 'deadlines',
    date: '2026-11-30',
    read: false,
    actionPath: '/life-certificate',
    actionLabel: 'Submit Now',
    icon: 'CalendarX2',
    color: 'teal',
  },
  {
    id: 'employer-filing',
    title: 'Employer Contribution Filing',
    body: 'Monthly PF contribution deadline is 15th of each month. Late filing attracts penal damages of up to 25%.',
    category: 'contributions',
    date: '2026-08-15',
    read: true,
    actionPath: '/passbook',
    actionLabel: 'View Contributions',
    icon: 'AlertTriangle',
    color: 'amber',
  },
  {
    id: 'claim-approved',
    title: 'Claim #4521 Approved',
    body: 'Your PF withdrawal claim of ₹1,25,000 has been approved. Disbursement will be credited within 3-5 business days.',
    category: 'claims',
    date: '2026-08-20',
    read: false,
    actionPath: '/claim',
    actionLabel: 'View Claim',
    icon: 'CheckCircle2',
    color: 'emerald',
  },
  {
    id: 'transfer-pending',
    title: 'Transfer Request Pending',
    body: 'Your transfer request from UAN 10123456789 is pending employer approval. It has been 5 days since submission.',
    category: 'claims',
    date: '2026-08-15',
    read: false,
    actionPath: '/transfer',
    actionLabel: 'Track Transfer',
    icon: 'ArrowRightLeft',
    color: 'indigo',
  },
  {
    id: 'pf-credit',
    title: 'PF Credit Received',
    body: '₹8,500 credited to your PF account on 05 Aug 2026. Your total balance is now ₹1,50,280.',
    category: 'contributions',
    date: '2026-08-05',
    read: true,
    actionPath: '/passbook',
    actionLabel: 'View Passbook',
    icon: 'Wallet',
    color: 'violet',
  },
  {
    id: 'kyc-mismatch',
    title: 'KYC Mismatch Detected',
    body: 'Your Aadhaar name does not match PAN records. This may delay claim processing. Update your documents to resolve.',
    category: 'alerts',
    date: '2026-08-10',
    read: false,
    actionPath: '/kyc-mismatch',
    actionLabel: 'Fix Mismatch',
    icon: 'ShieldAlert',
    color: 'rose',
  },
  {
    id: 'multiple-uan',
    title: 'Multiple UAN Accounts Found',
    body: 'We found ₹45,000 in an old UAN. Merge it to your current account to earn maximum interest.',
    category: 'alerts',
    date: '2026-08-01',
    read: false,
    actionPath: '/merge-accounts',
    actionLabel: 'Merge Accounts',
    icon: 'AlertTriangle',
    color: 'orange',
  },
];

export interface NotificationState {
  enabled: boolean;
  email: string;
  whatsapp: string;
  notifyDeadlines: boolean;
  notifyClaimUpdates: boolean;
  notifyMonthlyCredits: boolean;
  consentGiven: boolean;
  consentTimestamp: string | null;
  notifications: NotificationItem[];
  activeCardIndex: number;

  // Actions
  updateSettings: (settings: Partial<Omit<NotificationState, 'updateSettings' | 'giveConsent' | 'revokeConsent' | 'toggleNotifications' | 'markRead' | 'markAllRead' | 'setActiveCardIndex'>>) => void;
  toggleNotifications: (enabled: boolean) => void;
  giveConsent: () => void;
  revokeConsent: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setActiveCardIndex: (index: number) => void;
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
      notifications: DEMO_NOTIFICATIONS,
      activeCardIndex: 0,

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
      }),

      markRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      })),

      markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      })),

      setActiveCardIndex: (index) => set({ activeCardIndex: index }),
    }),
    {
      name: 'epfo-notifications',
    }
  )
);
