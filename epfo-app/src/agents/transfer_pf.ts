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
  rootCause: 'EPFO PF balances are tied to individual employer establishments, not the member. When switching jobs, old balance stays dormant unless manually transferred via Form 13. Many workers lose track of old accounts or assume balances transfer automatically — leading to crores of unclaimed PF.',
  apiIntegration: 'Production: EPFO Passbook API (enumerate previous employer accounts), EPFO Form-13 Transfer API (initiate transfer request), ECR employer verification API (confirm previous employer PF registration). SMS/email status updates via EPFO notification service.',
  scaleNote: 'Transfer requests are idempotent — duplicate submissions are deduplicated by UAN+establishment pair. Previous employer\'s EPFO trust or exempted establishment is detected automatically and routed to the correct settlement authority.',
};
