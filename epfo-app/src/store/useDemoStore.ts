import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DemoScenario {
  id: string;
  label: string;
}

interface DemoState {
  activeScenario: string;
  setScenario: (id: string) => void;
  clearScenario: () => void;

  isKycMissing: () => boolean;
  isKycMismatch: () => boolean;
  isClaimRejected: () => boolean;
  isEmployerPending: () => boolean;
  isExitNotMarked: () => boolean;
  hasMultipleUans: () => boolean;
  isNomineeMissing: () => boolean;
  isPensionCertIssue: () => boolean;
  isAdvanceRejected: () => boolean;
  isBankNotSeeded: () => boolean;
  isAadhaarConflict: () => boolean;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      activeScenario: 'happy',
      setScenario: (id) => set({ activeScenario: id }),
      clearScenario: () => set({ activeScenario: 'happy' }),

      isKycMissing: () => get().activeScenario === 'no_kyc',
      isKycMismatch: () => get().activeScenario === 'kyc_wrong',
      isClaimRejected: () => get().activeScenario === 'claim_denied',
      isEmployerPending: () => get().activeScenario === 'employer_hold',
      isExitNotMarked: () => get().activeScenario === 'no_exit',
      hasMultipleUans: () => get().activeScenario === 'multi_uan',
      isNomineeMissing: () => get().activeScenario === 'no_nominee',
      isPensionCertIssue: () => get().activeScenario === 'pension_cert',
      isAdvanceRejected: () => get().activeScenario === 'advance_rejected',
      isBankNotSeeded: () => get().activeScenario === 'bank_not_seeded',
      isAadhaarConflict: () => get().activeScenario === 'aadhaar_conflict',
    }),
    {
      name: 'epfo-demo-scenario',
    }
  )
);

export const DEMO_SCENARIOS: DemoScenario[] = [
  { id: 'happy', label: 'Happy Path — Everything Works' },
  { id: 'no_kyc', label: 'Missing KYC — Prerequisite Blocks Claim' },
  { id: 'kyc_wrong', label: 'KYC Mismatch — Name/DOB Differs from Aadhaar' },
  { id: 'claim_denied', label: 'PF Claim Rejected — Need to Appeal' },
  { id: 'employer_hold', label: 'Employer Not Approving — SLA Tracking' },
  { id: 'no_exit', label: 'Exit Date Not Marked — Transfer Blocked' },
  { id: 'multi_uan', label: 'Multiple UANs — Merge Required' },
  { id: 'no_nominee', label: 'Nominee Not Updated — Claim Stuck' },
  { id: 'pension_cert', label: 'Pension Certificate — Scheme Cert Fails' },
  { id: 'advance_rejected', label: 'Advance Rejected — Eligibility Mismatch' },
  { id: 'bank_not_seeded', label: 'Bank Not Seeded — Disbursement Fails' },
  { id: 'aadhaar_conflict', label: 'Aadhaar Conflict — Wrong UAN Linkage' },
  { id: 'multi_phase', label: 'Multi-Phase — Fix KYC + Withdraw PF' },
  { id: 'multi_phase_exit', label: 'Multi-Phase — Mark Exit + Withdraw PF' },
  { id: 'multi_phase_merge', label: 'Multi-Phase — Merge + Transfer + Withdraw' },
  { id: 'multi_phase_aadhaar', label: 'Multi-Phase — Aadhaar Fix + KYC + Withdraw' },
];
