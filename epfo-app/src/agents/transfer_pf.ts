import type { AgentConfig } from './types';
import { AGENT_THEMES } from './themes';

export const transferPFAgent: AgentConfig = {
  flowType: 'transfer_pf',
  label: 'Transfer PF',
  description: 'Transfer your PF balance from a previous employer to your current account.',
  colors: AGENT_THEMES.transfer_pf,
  initMessages: [
    'Initializing Transfer PF Agent...',
    'Scanning for previous employer accounts...',
    'Checking transfer eligibility...',
    'Plan generated. Ready to start.',
  ],
  generatePlan: () => [
    { step: 'verify_identity', description: 'Verify Identity & UAN', status: 'active' },
    { step: 'fetch_employment', description: 'Fetch Employment History', status: 'pending' },
    { step: 'initiate_transfer', description: 'Initiate Transfer Request', status: 'pending' },
    { step: 'submit_transfer', description: 'Submit with Aadhaar OTP', status: 'pending' },
  ],
  steps: {
    verify_identity: { agentState: 'in_progress', message: 'Verifying your identity against EPFO records...', avatarState: 'checking' },
    fetch_employment: { agentState: 'in_progress', message: 'I\'m scanning your employment history for previous accounts...', avatarState: 'fetching' },
    initiate_transfer: { agentState: 'needs_user', message: 'Found your previous accounts. Please review and confirm which ones to transfer.', avatarState: 'reviewing' },
    submit_transfer: { agentState: 'sensitive_action', message: 'Transfer request ready. Please authorize with your Aadhaar OTP.', avatarState: 'authenticating' },
  },
};
