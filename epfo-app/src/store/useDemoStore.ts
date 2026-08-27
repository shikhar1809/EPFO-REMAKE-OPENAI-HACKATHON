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

  isAadhaarConflict: () => boolean;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      activeScenario: 'happy',
      setScenario: (id) => set({ activeScenario: id }),
      clearScenario: () => set({ activeScenario: 'happy' }),

      isKycMissing: () => get().activeScenario === 'no_kyc',
      isKycMismatch: () => ['kyc_wrong', 'multi_phase', 'multi_phase_aadhaar'].includes(get().activeScenario),
      isClaimRejected: () => get().activeScenario === 'claim_denied',
      isEmployerPending: () => get().activeScenario === 'employer_hold',
      isExitNotMarked: () => ['multi_phase_exit'].includes(get().activeScenario),
      hasMultipleUans: () => ['multi_uan', 'multi_phase_merge'].includes(get().activeScenario),
      isNomineeMissing: () => get().activeScenario === 'no_nominee',
      isPensionCertIssue: () => get().activeScenario === 'pension_cert',
      isAdvanceRejected: () => get().activeScenario === 'advance_rejected',

      isAadhaarConflict: () => ['aadhaar_conflict', 'multi_phase_aadhaar'].includes(get().activeScenario),
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
  { id: 'employer_hold', label: 'Employer Non Approval for PF and all' },
  { id: 'multi_uan', label: 'Multiple UANs — Merge Required' },
  { id: 'no_nominee', label: 'Nominee Not Updated — Claim Stuck' },
  { id: 'pension_cert', label: 'Pension Certificate — Scheme Cert Fails' },
  { id: 'advance_rejected', label: 'Advance Rejected — Eligibility Mismatch' },
  { id: 'aadhaar_conflict', label: 'Aadhaar Conflict — Wrong UAN Linkage' },
  { id: 'multi_phase', label: 'Multi-Phase — Fix KYC + Withdraw PF' },
  { id: 'multi_phase_exit', label: 'Multi-Phase — Mark Exit + Withdraw PF' },
  { id: 'multi_phase_merge', label: 'Multi-Phase — Merge + Transfer + Withdraw' },
  { id: 'multi_phase_aadhaar', label: 'Multi-Phase — Aadhaar Fix + KYC + Withdraw' },
];
