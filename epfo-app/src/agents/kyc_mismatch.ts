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
  rootCause: 'Mismatches arise because EPFO maintains its own member database separate from UIDAI. When employers enter names at onboarding they often abbreviate or misspell, creating a permanent discrepancy. Resolving it requires a Joint Declaration signed physically by the employer — a process that can take 3–6 months.',
  apiIntegration: 'Production: EPFO Member Passbook API (fetch current records), UIDAI Aadhaar Data API (pull canonical name/DOB), EPFO Joint Declaration submission endpoint (POST with employer DSC or Aadhaar e-sign). Employer notification via registered email/SMS.',
  scaleNote: 'Mismatch diffs are computed server-side and never stored client-side. Joint Declarations use UIDAI e-sign (no physical paper). Employer approval integrated via webhook — no polling needed. Field office escalation auto-triggered after 30 days.',
};
