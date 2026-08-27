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
  rootCause: 'When a member changes jobs, the new employer sometimes creates a fresh UAN instead of using the existing one. Both UANs then try to claim the same Aadhaar, leaving one permanently conflicted. EPFO has no self-service de-link tool — members must visit a field office, often losing weeks of access.',
  apiIntegration: 'Production: UIDAI Aadhaar Seeding API (check current linkage), EPFO UAN Delink API (requires OTP + biometric consent), EPFO UAN Relink API (re-associate Aadhaar with correct UAN). All calls TLS 1.3 + UIDAI registered IP whitelist.',
  scaleNote: 'De-link/re-link operations are atomic and idempotent. Conflict detection is read-only and stateless. All PII transmitted over encrypted channels; nothing stored in browser. Audit trail written to EPFO event log for regulatory compliance.',
};
