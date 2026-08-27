import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Establishment {
  name: string;
  memberId: string;
  joinDate: string;
  exitDate?: string;
  lastContribution: string;
  balance: number;
  status: 'active' | 'exited' | 'merged';
}

interface AccountState {
  balance: {
    total: number;
    employee: number;
    employer: number;
    pension: number;
  };
  establishments: Establishment[];
  kycStatus: {
    aadhaar: boolean;
    pan: boolean;
    bank: boolean;
    nominee: boolean;
  };
  lastContribution: string;
  serviceMonths: number;
  exitStatus: {
    marked: boolean;
    date?: string;
  };
  lastTransaction: {
    date: string;
    amount: number;
    employer: string;
    type: 'credit' | 'debit';
  };
}

const MOCK_ESTABLISHMENTS: Establishment[] = [
  {
    name: 'HCL Technologies',
    memberId: 'HCL/100904/2019',
    joinDate: 'Jan 2019',
    exitDate: 'Mar 2021',
    lastContribution: 'Feb 2021',
    balance: 45000,
    status: 'exited',
  },
  {
    name: 'Infosys Ltd',
    memberId: 'INF/100904/2021',
    joinDate: 'Apr 2021',
    exitDate: 'Aug 2023',
    lastContribution: 'Jul 2023',
    balance: 65000,
    status: 'exited',
  },
  {
    name: 'TCS (Tata Consultancy Services)',
    memberId: 'TCS/100904/2023',
    joinDate: 'Sep 2023',
    lastContribution: 'Aug 2026',
    balance: 124280,
    status: 'active',
  },
];

export const useAccountStore = create<AccountState>()(
  persist(
    (): AccountState => ({
      balance: {
        total: 234560,
        employee: 142280,
        employer: 65780,
        pension: 26500,
      },
      establishments: MOCK_ESTABLISHMENTS,
      kycStatus: {
        aadhaar: true,
        pan: true,
        bank: true,
        nominee: false,
      },
      lastContribution: 'Aug 2026',
      serviceMonths: 38,
      exitStatus: {
        marked: false,
      },
      lastTransaction: {
        date: '12 Aug 2026',
        amount: 3600,
        employer: 'TCS',
        type: 'credit',
      },
    }),
    {
      name: 'epfo-account-data',
    }
  )
);
