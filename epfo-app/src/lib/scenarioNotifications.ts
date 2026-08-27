import type { NotificationItem } from '../store/useNotificationStore';

const SCENARIO_NOTIFICATIONS: Record<string, NotificationItem[]> = {
  no_kyc: [
    {
      id: 'scn-no-kyc',
      title: 'KYC Not Completed',
      body: 'Your KYC (Aadhaar + Bank + PAN) is not linked. You cannot file claims, transfers, or exit dates until KYC is complete.',
      category: 'alerts',
      date: '2026-08-27',
      read: false,
      actionPath: '/documents',
      actionLabel: 'Resolve KYC',
      icon: 'ShieldAlert',
      color: 'amber',
    },
  ],
  kyc_wrong: [
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
  ],
  claim_denied: [
    {
      id: 'scn-claim-denied',
      title: 'PF Claim Rejected',
      body: 'Your PF claim (Form 31 Advance) was rejected. EPFO says insufficient documents. You can appeal or re-file with correct documents.',
      category: 'alerts',
      date: '2026-08-26',
      read: false,
      actionPath: '/claim',
      actionLabel: 'View Claim',
      icon: 'AlertTriangle',
      color: 'rose',
    },
  ],
  employer_hold: [
    {
      id: 'scn-employer-hold',
      title: 'Waiting for Employer Approval',
      body: 'Your withdrawal request is with your employer for sign-off. The live SLA clock is running on your dashboard — 3 of the 5 working days have elapsed.',
      category: 'alerts',
      date: '2026-08-24',
      read: false,
      actionPath: '/history',
      actionLabel: 'Track Request',
      icon: 'AlertTriangle',
      color: 'blue',
    },
  ],
  multi_uan: [
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
  ],
  no_nominee: [
    {
      id: 'scn-no-nominee',
      title: 'e-Nomination Not Filed',
      body: 'Your claim is pending because e-nomination is not updated. Without it, your family cannot claim PF in case of death.',
      category: 'alerts',
      date: '2026-08-25',
      read: false,
      actionPath: '/smart-flow',
      actionLabel: 'File Nomination',
      icon: 'ShieldAlert',
      color: 'violet',
    },
  ],
  pension_cert: [
    {
      id: 'scn-pension-cert',
      title: 'Pension Certificate Mismatch',
      body: 'Your Scheme Certificate / Form 10D failed due to service-history mismatch. Check your employment records.',
      category: 'alerts',
      date: '2026-08-22',
      read: false,
      actionPath: '/life-certificate',
      actionLabel: 'View Certificate',
      icon: 'ShieldAlert',
      color: 'teal',
    },
  ],
  advance_rejected: [
    {
      id: 'scn-advance-rejected',
      title: 'PF Advance Rejected',
      body: 'Your PF advance claim (Form 31) was rejected due to insufficient service years. You need at least 5 years of service for education/illness advance.',
      category: 'alerts',
      date: '2026-08-21',
      read: false,
      actionPath: '/claim',
      actionLabel: 'View Claim',
      icon: 'AlertTriangle',
      color: 'rose',
    },
  ],
  bank_not_seeded: [
    {
      id: 'scn-bank-not-seeded',
      title: 'Bank Account Not Verified',
      body: 'Your claim was approved but disbursement failed. The linked bank account is not verified or IFSC is outdated.',
      category: 'alerts',
      date: '2026-08-20',
      read: false,
      actionPath: '/documents',
      actionLabel: 'Fix Bank KYC',
      icon: 'ShieldAlert',
      color: 'indigo',
    },
  ],
  aadhaar_conflict: [
    {
      id: 'scn-aadhaar-conflict',
      title: 'Aadhaar Linked to Wrong UAN',
      body: 'Your Aadhaar is already linked to another UAN. This blocks activation of your current UAN. You need to merge or de-link.',
      category: 'alerts',
      date: '2026-08-19',
      read: false,
      actionPath: '/smart-flow',
      actionLabel: 'Resolve Link',
      icon: 'ShieldAlert',
      color: 'rose',
    },
  ],
  no_exit: [
    {
      id: 'scn-no-exit',
      title: 'Exit Date Not Marked',
      body: 'Your previous employer has not updated your date of exit. Transfers and claims are blocked until it is marked.',
      category: 'alerts',
      date: '2026-08-18',
      read: false,
      actionPath: '/mark-exit',
      actionLabel: 'Mark Exit',
      icon: 'AlertTriangle',
      color: 'amber',
    },
  ],
};

export const getScenarioNotifications = (activeScenario: string): NotificationItem[] => {
  const map: Record<string, string[]> = {
    multi_phase: ['kyc_wrong'],
    multi_phase_exit: ['no_exit'],
    multi_phase_merge: ['multi_uan'],
    multi_phase_aadhaar: ['aadhaar_conflict', 'kyc_wrong'],
  };
  
  if (SCENARIO_NOTIFICATIONS[activeScenario]) {
    return SCENARIO_NOTIFICATIONS[activeScenario];
  }
  
  if (map[activeScenario]) {
    return map[activeScenario].flatMap(key => SCENARIO_NOTIFICATIONS[key] || []);
  }
  
  return [];
};

export const mergeNotifications = (notifications: NotificationItem[], activeScenario: string): NotificationItem[] => {
  const scenario = getScenarioNotifications(activeScenario);
  
  // If we have specific scenario notifications, just show those to keep the demo focused!
  if (scenario.length > 0) {
    return scenario;
  }
  
  // Otherwise (e.g., 'happy' scenario), just show a few general non-alert ones
  return notifications.filter(n => n.category !== 'alerts');
};