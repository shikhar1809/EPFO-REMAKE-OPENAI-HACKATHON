import { useSessionStore } from '../store/useSessionStore';
import { useDataStore } from '../store/useDataStore';
import { useWorkflowStore } from '../store/useWorkflowStore';

export const resetDemoBaseline = () => {
  useSessionStore.setState({
    isAuthenticated: true,
    user: { uan: '100904838291', phone: '9876543210', name: 'Rahul Sharma' },
  });
  useDataStore.setState({
    profile: { name: 'Rahul Sharma', uan: '100904838291', pan: 'ABCDE1234F', aadhaar: 'XXXX-XXXX-8921', bankAccount: 'XXXXXX4892' },
    claims: [
      { id: 'CLM-001', type: 'Form 31 (Advance)', status: 'Approved', date: '2026-05-12', amount: 50000 },
    ],
  });
  useWorkflowStore.getState().clearAllTasks();
};