import type { AgentConfig } from './types';
import { AGENT_THEMES } from './themes';

export const lifeCertificateAgent: AgentConfig = {
  flowType: 'life_certificate',
  label: 'Life Certificate',
  description: 'Submit your Digital Life Certificate (Jeevan Pramaan) for pension continuity.',
  colors: AGENT_THEMES.life_certificate,
  initMessages: [
    'Initializing Life Certificate Agent...',
    'Fetching pension details...',
    'Checking certificate status...',
    'Plan generated. Ready to start.',
  ],
  generatePlan: () => [
    { step: 'verify_identity', description: 'Verify Identity & UAN', status: 'active' },
    { step: 'fetch_pension_details', description: 'Fetch Pension Details', status: 'pending' },
    { step: 'capture_face', description: 'Face Auth for Life Certificate', status: 'pending' },
    { step: 'submit_certificate', description: 'Submit Certificate', status: 'pending' },
  ],
  steps: {
    verify_identity: { agentState: 'in_progress', message: 'Verifying your identity against EPFO records...', avatarState: 'checking' },
    fetch_pension_details: { agentState: 'in_progress', message: 'I\'m fetching your pension and PPO details from EPFO...', avatarState: 'fetching' },
    capture_face: { agentState: 'needs_user', message: 'Your pension details are ready. Please complete the face auth to generate your Life Certificate.', avatarState: 'reading' },
    submit_certificate: { agentState: 'in_progress', message: 'Face matched! Generating your Pramaan ID and submitting to EPFO...', avatarState: 'generating' },
  },
};
