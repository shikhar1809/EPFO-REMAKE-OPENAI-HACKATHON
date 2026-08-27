import type { AgentConfig } from './types';
import { AGENT_THEMES } from './themes';

export const withdrawPFAgent: AgentConfig = {
  flowType: 'withdraw_pf',
  label: 'Withdraw PF',
  description: 'Withdraw your PF balance for medical, education, or other eligible purposes.',
  colors: AGENT_THEMES.withdraw_pf,
  initMessages: [
    'Initializing Withdraw PF Agent...',
    'Verifying your UAN with EPFO...',
    'Checking withdrawal eligibility...',
    'Plan generated. Ready to start.',
  ],
  generatePlan: () => [
    { step: 'verify_identity', description: 'Verify Identity & UAN', status: 'active' },
    { step: 'check_eligibility', description: 'Check Bank & Eligibility', status: 'pending' },
    { step: 'gather_documents', description: 'Gather Documents from Vault', status: 'pending' },
    { step: 'review_claim', description: 'Review Claim Details', status: 'pending' },
    { step: 'submit_claim', description: 'Submit Claim with Aadhaar OTP', status: 'pending' },
  ],
  steps: {
    verify_identity: { agentState: 'in_progress', message: 'I\'m verifying your UAN against EPFO records. This takes a moment...', avatarState: 'checking' },
    check_eligibility: { agentState: 'needs_user', message: 'Your identity is verified. Now I need to confirm your linked bank account. Please enter the last 4 digits.', avatarState: 'checking' },
    gather_documents: { agentState: 'in_progress', message: 'Great, bank verified. I\'m pulling your KYC documents from the vault now...', avatarState: 'fetching' },
    review_claim: { agentState: 'needs_user', message: 'Documents are ready. Please review and confirm your claim details below.', avatarState: 'reviewing' },
    submit_claim: { agentState: 'sensitive_action', message: 'Everything looks good. Please authorize this claim with your Aadhaar OTP.', avatarState: 'authenticating' },
  },
  rootCause: 'EPFO\'s Form 19/31 requires navigating 6+ screens, manual PDF uploads, and a separate employer digital signature — all without any status tracking. Over 40% of claims are returned for documentation errors.',
  apiIntegration: 'Production: EPFO Unified Portal REST API (claim submission), UIDAI e-KYC OTP API (Aadhaar auth), NPCI Account Validation API (bank verification). All calls would be server-side with OAuth 2.0 + mTLS.',
  scaleNote: 'Stateless agent design allows horizontal scaling. Checkpoints persist to Redis with a 7-day TTL. Sensitive OTP tokens are never stored — only a session token from UIDAI. Rate-limited at 10 req/min per UAN.',
};
