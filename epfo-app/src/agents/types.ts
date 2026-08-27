import type { PlanStep } from '../store/useWorkflowStore';
import type { AvatarState } from '../components/ui/AssistantAvatar';

export interface AgentColorTheme {
  name: string;
  primary: string;
  primaryRgb: string;
  gradient: string;
  ring: string;
  chatBubble: string;
  textPrimary: string;
  textDark: string;
  bgLight: string;
  borderLight: string;
  icon: string;
  label: string;
}

export interface StepConfig {
  agentState: 'needs_user' | 'sensitive_action' | 'in_progress';
  message: string;
  avatarState: AvatarState;
}

export interface AgentConfig {
  flowType: string;
  label: string;
  description: string;
  colors: AgentColorTheme;
  initMessages: string[];
  generatePlan: () => PlanStep[];
  steps: Record<string, StepConfig>;
}
