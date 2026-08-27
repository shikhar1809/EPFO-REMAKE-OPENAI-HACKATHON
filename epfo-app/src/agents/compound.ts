import type { PlanStep, Phase } from '../store/useWorkflowStore';
import { getAgent } from './registry';

export function buildMultiPhaseTask(flows: string[]): { phases: Phase[]; combinedPlan: PlanStep[] } {
  return buildMultiPhaseTaskAt(flows, 0, 0);
}

export function buildMultiPhaseTaskAt(flows: string[], activePhaseIdx: number, activeStepIdx: number): { phases: Phase[]; combinedPlan: PlanStep[] } {
  const phases: Phase[] = flows.map((flowType, idx) => {
    const agent = getAgent(flowType);
    return {
      id: `phase-${idx}`,
      label: agent.label,
      description: agent.description,
      taskType: flowType,
      plan: agent.generatePlan().map((p, stepIdx) => {
        if (idx < activePhaseIdx) return { ...p, status: 'completed' as const };
        if (idx === activePhaseIdx) {
          if (stepIdx < activeStepIdx) return { ...p, status: 'completed' as const };
          if (stepIdx === activeStepIdx) return { ...p, status: 'active' as const };
        }
        return { ...p, status: 'pending' as const };
      }),
      status: idx < activePhaseIdx ? 'completed' as const : idx === activePhaseIdx ? 'active' as const : 'pending' as const,
    };
  });

  const combinedPlan: PlanStep[] = phases.flatMap((phase, phaseIdx) =>
    phase.plan.map((p) => ({
      step: `phase${phaseIdx}_${p.step}`,
      description: p.description,
      status: p.status,
    }))
  );

  return { phases, combinedPlan };
}
