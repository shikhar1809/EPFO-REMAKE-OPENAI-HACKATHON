import type { AgentConfig, StepConfig } from './types';
import { DEFAULT_THEME } from './themes';
import { withdrawPFAgent } from './withdraw_pf';
import { kycMismatchAgent } from './kyc_mismatch';
import { aadhaarFixAgent } from './aadhaar_fix';
import { transferPFAgent } from './transfer_pf';
import { markExitAgent } from './mark_exit';
import { lifeCertificateAgent } from './life_certificate';
import { mergeAccountsAgent } from './merge_accounts';
import { grievanceAgent } from './grievance';
import type { PlanStep } from '../store/useWorkflowStore';

const AGENTS: Record<string, AgentConfig> = {
  withdraw_pf: withdrawPFAgent,
  kyc_mismatch: kycMismatchAgent,
  aadhaar_fix: aadhaarFixAgent,
  transfer_pf: transferPFAgent,
  mark_exit: markExitAgent,
  life_certificate: lifeCertificateAgent,
  merge_accounts: mergeAccountsAgent,
  grievance: grievanceAgent,
};

export function getAgent(flowType: string): AgentConfig {
  return AGENTS[flowType] || {
    flowType,
    label: flowType.replace(/_/g, ' '),
    description: 'General inquiry agent.',
    colors: DEFAULT_THEME,
    initMessages: [
      'Initializing Agent...',
      'Processing request...',
      'Plan generated. Ready to start.',
    ],
    generatePlan: () => [
      { step: 'verify_identity', description: 'Verify Identity', status: 'active' },
      { step: 'process_inquiry', description: 'Process Inquiry', status: 'pending' },
      { step: 'resolve_inquiry', description: 'Resolve & Respond', status: 'pending' },
    ],
    steps: {
      verify_identity: { agentState: 'in_progress', message: 'Verifying your identity...', avatarState: 'checking' },
      process_inquiry: { agentState: 'in_progress', message: 'Processing your inquiry...', avatarState: 'reading' },
      resolve_inquiry: { agentState: 'in_progress', message: 'Resolving your inquiry...', avatarState: 'generating' },
    },
  };
}

export function getStepConfig(flowType: string, stepName: string): StepConfig | null {
  const agent = getAgent(flowType);
  const bareName = stepName.replace(/^phase\d+_/, '');
  return agent.steps[bareName] || null;
}

export function getAgentColors(flowType: string) {
  return getAgent(flowType).colors;
}

export function generatePlan(flowType: string): PlanStep[] {
  return getAgent(flowType).generatePlan();
}

export function getAllAgents(): AgentConfig[] {
  return Object.values(AGENTS);
}
