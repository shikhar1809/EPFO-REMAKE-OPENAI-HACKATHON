import type { AgentConfig } from './types';
import { AGENT_THEMES } from './themes';

export const kycMismatchAgent: AgentConfig = {
  flowType: 'kyc_mismatch',
  label: 'Fix KYC Mismatch',
  description: 'Fix name/DOB mismatches between EPFO records and Aadhaar via Joint Declaration.',
  colors: AGENT_THEMES.kyc_mismatch,
  initMessages: [
    'Initializing KYC Fix Agent...',
    'Comparing EPFO records with Aadhaar...',
    'Analyzing mismatch fields...',
    'Plan generated. Ready to start.',
  ],
  generatePlan: () => [
    { step: 'verify_identity', description: 'Verify Identity & UAN', status: 'active' },
    { step: 'analyze_mismatch', description: 'Analyze KYC Mismatch', status: 'pending' },
    { step: 'draft_declaration', description: 'Draft Joint Declaration', status: 'pending' },
    { step: 'submit_declaration', description: 'Submit with Aadhaar OTP', status: 'pending' },
  ],
  steps: {
    verify_identity: { agentState: 'in_progress', message: 'Verifying your identity against EPFO records...', avatarState: 'checking' },
    analyze_mismatch: { agentState: 'in_progress', message: 'I\'ve found the mismatches between your EPFO records and Aadhaar. Let me prepare the comparison...', avatarState: 'reading' },
    draft_declaration: { agentState: 'needs_user', message: 'Here\'s the diff. Please select the fields you want to correct in the Joint Declaration.', avatarState: 'reviewing' },
    submit_declaration: { agentState: 'sensitive_action', message: 'Declaration ready. Please sign with your Aadhaar OTP to submit.', avatarState: 'authenticating' },
  },
};
