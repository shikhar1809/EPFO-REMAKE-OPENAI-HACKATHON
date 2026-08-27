import type { AgentConfig } from './types';
import { AGENT_THEMES } from './themes';

export const markExitAgent: AgentConfig = {
  flowType: 'mark_exit',
  label: 'Mark Exit Date',
  description: 'Self-declare your date of exit from employment for PF transfer/withdrawal.',
  colors: AGENT_THEMES.mark_exit,
  initMessages: [
    'Initializing Mark Exit Agent...',
    'Checking employment records...',
    'Verifying exit eligibility...',
    'Plan generated. Ready to start.',
  ],
  generatePlan: () => [
    { step: 'verify_identity', description: 'Verify Identity & UAN', status: 'active' },
    { step: 'fetch_employment', description: 'Fetch Employment History', status: 'pending' },
    { step: 'select_exit_reason', description: 'Select Exit Reason & Date', status: 'pending' },
    { step: 'submit_exit', description: 'Submit with Aadhaar OTP', status: 'pending' },
  ],
  steps: {
    verify_identity: { agentState: 'in_progress', message: 'Verifying your identity against EPFO records...', avatarState: 'checking' },
    fetch_employment: { agentState: 'in_progress', message: 'Fetching your employment history to check which establishments are eligible for exit marking...', avatarState: 'fetching' },
    select_exit_reason: { agentState: 'needs_user', message: 'Here are your eligible establishments. Please select one and provide the exit date and reason.', avatarState: 'reviewing' },
    submit_exit: { agentState: 'sensitive_action', message: 'Exit declaration ready. Please authorize with your Aadhaar OTP.', avatarState: 'authenticating' },
  },
  rootCause: 'Employers are legally required to mark employee exit in EPFO ECR within 15 days of separation. Most SMEs miss this deadline, leaving members unable to withdraw PF for months. The current self-mark-exit feature on the EPFO portal is buried under 4 menu levels and frequently times out.',
  apiIntegration: 'Production: EPFO ECR Employment API (fetch active establishments), EPFO Self-Exit API (member self-declaration with exit date/reason), employer notification via EPFO email relay. Aadhaar e-sign required per SOP circular 2023.',
  scaleNote: 'Exit declarations are queued and batch-processed every hour to avoid EPFO API rate limits. Employer dispute window is 7 days; after that, declaration is auto-accepted. All timestamps stored in IST with audit trail for legal compliance.',
};
