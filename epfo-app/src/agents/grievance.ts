import type { AgentConfig } from './types';
import { AGENT_THEMES } from './themes';

export const grievanceAgent: AgentConfig = {
  flowType: 'grievance',
  label: 'File Grievance',
  description: 'Register a grievance with EPFiGMS for PF, pension, or employer-related issues.',
  colors: AGENT_THEMES.grievance,
  initMessages: [
    'Initializing Grievance Agent...',
    'Connecting to EPFiGMS...',
    'Preparing grievance form...',
    'Plan generated. Ready to start.',
  ],
  generatePlan: () => [
    { step: 'verify_identity', description: 'Verify Identity & UAN', status: 'active' },
    { step: 'analyze_issue', description: 'Analyze Issue Context', status: 'pending' },
    { step: 'register_grievance', description: 'Register Grievance', status: 'pending' },
    { step: 'generate_reference', description: 'Generate Ticket Reference', status: 'pending' },
  ],
  steps: {
    verify_identity: { agentState: 'in_progress', message: 'Verifying your identity against EPFO records...', avatarState: 'checking' },
    analyze_issue: { agentState: 'in_progress', message: 'I\'m analyzing your issue context to categorize the grievance correctly...', avatarState: 'reading' },
    register_grievance: { agentState: 'needs_user', message: 'I\'ve categorized your issue. Please fill in the grievance details below.', avatarState: 'reviewing' },
    generate_reference: { agentState: 'in_progress', message: 'Grievance registered! Generating your ticket reference number...', avatarState: 'generating' },
  },
};
