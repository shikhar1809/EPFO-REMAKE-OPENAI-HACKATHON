import type { AgentConfig } from './types';
import { AGENT_THEMES } from './themes';

export const aadhaarFixAgent: AgentConfig = {
  flowType: 'aadhaar_fix',
  label: 'Fix Aadhaar Conflict',
  description: 'Resolve Aadhaar linkage conflict — de-link from the wrong UAN and re-link to the correct one.',
  colors: AGENT_THEMES.aadhaar_fix,
  initMessages: [
    'Initializing Aadhaar Fix Agent...',
    'Querying UIDAI linkage database...',
    'Conflict detected. Analyzing UANs...',
    'Plan generated. Ready to start.',
  ],
  generatePlan: () => [
    { step: 'verify_identity', description: 'Verify Identity & UAN', status: 'active' },
    { step: 'detect_conflict', description: 'Detect Aadhaar Conflict', status: 'pending' },
    { step: 'delink_aadhaar', description: 'De-link from Wrong UAN', status: 'pending' },
    { step: 'relink_aadhaar', description: 'Re-link to Correct UAN', status: 'pending' },
  ],
  steps: {
    verify_identity: { agentState: 'in_progress', message: 'Verifying your identity and checking Aadhaar linkage status with UIDAI...', avatarState: 'checking' },
    detect_conflict: { agentState: 'needs_user', message: 'I found your Aadhaar is linked to a different UAN. Here are the details of the conflict.', avatarState: 'reading' },
    delink_aadhaar: { agentState: 'sensitive_action', message: 'To de-link your Aadhaar from the conflicting UAN, please authenticate with your Aadhaar OTP.', avatarState: 'authenticating' },
    relink_aadhaar: { agentState: 'in_progress', message: 'De-link complete. Now re-linking your Aadhaar to your correct active UAN...', avatarState: 'generating' },
  },
};
