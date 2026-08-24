import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
  name: string;
  uan: string;
  pan: string;
  aadhaar: string;
  bankAccount: string;
}

interface PassbookEntry {
  id: string;
  month: string;
  employeeShare: number;
  employerShare: number;
  pensionShare: number;
}

interface Claim {
  id: string;
  type: string;
  status: 'Submitted' | 'Under Process' | 'Approved' | 'Rejected';
  date: string;
  amount?: number;
}

export interface ChatMessage {
  role: 'system' | 'user';
  text: string;
}

export interface ChecklistStep {
  id: number;
  title: string;
  desc: string;
  duration: number;
}

interface DataState {
  profile: UserProfile | null;
  passbook: PassbookEntry[];
  claims: Claim[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  activeGoal: string | null;
  activeWorkflowStep: number;
  workflowSessionId: string | null;
  pendingChecklist: ChecklistStep[] | null;
  workflowSteps: ChecklistStep[];
  fetchData: () => Promise<void>;
  submitClaim: (type: string, amount: number) => Promise<boolean>;
  addChatMessage: (msg: ChatMessage) => void;
  setGoal: (goal: string | null) => void;
  updateWorkflowStep: (step: number) => void;
  generateChecklist: (goal: string) => void;
  confirmChecklist: () => void;
  clearGoal: () => void;
}

const mockProfile: UserProfile = {
  name: 'Rahul Sharma',
  uan: '100904838291',
  pan: 'ABCDE1234F',
  aadhaar: 'XXXX-XXXX-8921',
  bankAccount: 'XXXXXX4892'
};

const mockPassbook: PassbookEntry[] = [
  { id: '1', month: 'Aug 2026', employeeShare: 1800, employerShare: 550, pensionShare: 1250 },
  { id: '2', month: 'Jul 2026', employeeShare: 1800, employerShare: 550, pensionShare: 1250 },
];

const generateId = () => Math.random().toString(36).substring(2, 9).toUpperCase();

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      profile: null,
      passbook: [],
      claims: [
        { id: 'CLM-001', type: 'Form 31 (Advance)', status: 'Approved', date: '2026-05-12', amount: 50000 }
      ],
      chatMessages: [
        { role: 'system', text: "What do you want to do today?" }
      ],
      isLoading: false,
      activeGoal: null,
      activeWorkflowStep: 1,
      workflowSessionId: null,
      pendingChecklist: null,
      workflowSteps: [],
      fetchData: async () => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 1500));
        set({ profile: mockProfile, passbook: mockPassbook, isLoading: false });
      },
      submitClaim: async (type, amount) => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 2000));
        set(state => {
          const newId = 'CLM-00' + (state.claims.length + 2);
          return {
            claims: [{ id: newId, type, status: 'Submitted', date: new Date().toISOString().split('T')[0], amount }, ...state.claims],
            isLoading: false
          };
        });
        return true;
      },
      addChatMessage: (msg) => set(state => ({ chatMessages: [...state.chatMessages, msg] })),
      setGoal: (goal) => set({ activeGoal: goal, activeWorkflowStep: 1, workflowSessionId: 'SESSION-' + generateId() }),
      updateWorkflowStep: (step) => set({ activeWorkflowStep: step }),
      generateChecklist: (goal) => {
        set({ 
          activeGoal: goal,
          pendingChecklist: [
            { id: 1, title: 'Analyze Goal', desc: 'Understanding your request...', duration: 1500 },
            { id: 2, title: 'Verify Eligibility', desc: 'Checking EPFO records for compliance.', duration: 2000 },
            { id: 3, title: 'Execute Action', desc: 'Processing your request securely.', duration: 2500 },
            { id: 4, title: 'Sync Session', desc: 'Saving state securely to Document Vault.', duration: 1500 },
            { id: 5, title: 'Finalize', desc: 'Workflow complete. Activating services.', duration: 1000 }
          ]
        });
      },
      confirmChecklist: () => set(state => ({
        workflowSteps: state.pendingChecklist || [],
        pendingChecklist: null,
        activeWorkflowStep: 1,
        workflowSessionId: 'SESS-' + generateId()
      })),
      clearGoal: () => set({ activeGoal: null, workflowSessionId: null, pendingChecklist: null, workflowSteps: [] })
    }),
    {
      name: 'epfo-data-storage',
      partialize: (state) => ({ 
        activeGoal: state.activeGoal, 
        activeWorkflowStep: state.activeWorkflowStep,
        workflowSessionId: state.workflowSessionId,
        workflowSteps: state.workflowSteps,
        claims: state.claims
      }),
    }
  )
);
