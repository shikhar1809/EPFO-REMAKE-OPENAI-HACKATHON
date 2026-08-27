import type { PlanStep, Phase } from '../store/useWorkflowStore';
import { getAgent } from './registry';

/**
 * Steps that are shared across many flows and should only appear ONCE
 * (in the very first phase) in a multi-phase compound flow.
 */
const DEDUP_STEPS = new Set(['verify_identity']);

export function buildMultiPhaseTask(flows: string[]): { phases: Phase[]; combinedPlan: PlanStep[] } {
  return buildMultiPhaseTaskAt(flows, 0, 0);
}

export function buildMultiPhaseTaskAt(
  flows: string[],
  activePhaseIdx: number,
  activeStepIdx: number
): { phases: Phase[]; combinedPlan: PlanStep[] } {
  const seenSteps = new Set<string>();

  const phases: Phase[] = flows.map((flowType, idx) => {
    const agent = getAgent(flowType);
    const allSteps = agent.generatePlan();

    // Filter out steps already seen in earlier phases
    const dedupedSteps = allSteps.filter((step) => {
      if (idx === 0) return true; // never filter the first phase
      if (DEDUP_STEPS.has(step.step) && seenSteps.has(step.step)) return false;
      return true;
    });

    // Track steps from this phase
    dedupedSteps.forEach((s) => seenSteps.add(s.step));

    const planSteps = dedupedSteps.map((p, stepIdx) => {
      if (idx < activePhaseIdx) return { ...p, status: 'completed' as const };
      if (idx === activePhaseIdx) {
        if (stepIdx < activeStepIdx) return { ...p, status: 'completed' as const };
        if (stepIdx === activeStepIdx) return { ...p, status: 'active' as const };
      }
      return { ...p, status: 'pending' as const };
    });

    return {
      id: `phase-${idx}`,
      label: agent.label,
      description: agent.description,
      taskType: flowType,
      plan: planSteps,
      status:
        idx < activePhaseIdx
          ? ('completed' as const)
          : idx === activePhaseIdx
          ? ('active' as const)
          : ('pending' as const),
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
