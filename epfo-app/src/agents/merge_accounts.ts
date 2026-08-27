import type { AgentConfig } from './types';
import { AGENT_THEMES } from './themes';

export const mergeAccountsAgent: AgentConfig = {
  flowType: 'merge_accounts',
  label: 'Merge Accounts',
  description: 'Merge duplicate UAN accounts into a single consolidated PF account.',
  colors: AGENT_THEMES.merge_accounts,
  initMessages: [
    'Initializing Merge Accounts Agent...',
    'Scanning for duplicate UANs...',
    'Calculating merge summary...',
    'Plan generated. Ready to start.',
  ],
  generatePlan: () => [
    { step: 'verify_identity', description: 'Verify Identity & UAN', status: 'active' },
    { step: 'fetch_linked_accounts', description: 'Fetch Linked Accounts', status: 'pending' },
    { step: 'select_accounts_to_merge', description: 'Confirm Accounts to Merge', status: 'pending' },
    { step: 'submit_merge_request', description: 'Submit Merge Request', status: 'pending' },
  ],
  steps: {
    verify_identity: { agentState: 'in_progress', message: 'Verifying your identity against EPFO records...', avatarState: 'checking' },
    fetch_linked_accounts: { agentState: 'in_progress', message: 'I\'m scanning for all UANs linked to your Aadhaar...', avatarState: 'fetching' },
    select_accounts_to_merge: { agentState: 'needs_user', message: 'Found multiple UANs. Please review and confirm which accounts to merge.', avatarState: 'reviewing' },
    submit_merge_request: { agentState: 'sensitive_action', message: 'Merge request ready. Please authorize with your Aadhaar OTP.', avatarState: 'authenticating' },
  },
  rootCause: 'Multiple UANs are generated when employers register members without checking if one already exists. India has over 65 million duplicate UAN pairs. Each duplicate blocks PF withdrawal, as EPFO cannot credit multiple accounts simultaneously. The current online merger tool has a >30% failure rate due to Aadhaar mis-seeding.',
  apiIntegration: 'Production: EPFO UAN Discovery API (find all UANs linked to Aadhaar), EPFO Account Merge API (mark inactive UANs, consolidate balance), EPFO Passbook API (verify transferred balance). Employer verification via EPF ECR portal API.',
  scaleNote: 'Merge is a two-phase commit: inactive UAN is locked before balance transfer to prevent race conditions. Rollback is possible if transfer fails. Event sourcing pattern ensures auditability. Account lock expires automatically after 72h if merge is not completed.',
};
