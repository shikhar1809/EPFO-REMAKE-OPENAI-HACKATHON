import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AgentState = 
  | 'idle' 
  | 'planned' 
  | 'in_progress' 
  | 'needs_user' 
  | 'sensitive_action' 
  | 'pending_employer'
  | 'completed' 
  | 'failed' 
  | 'recoverable';

export interface EmployerApproval {
  submittedAt: number;
  slaDays: number;
  employerName: string;
  escalated: boolean;
  taskReference: string;
}

export type PlanStep = { step: string; description: string; status: 'pending' | 'active' | 'completed' };

export interface Phase {
  id: string;
  label: string;
  description: string;
  taskType: string;
  plan: PlanStep[];
  status: 'pending' | 'active' | 'completed';
}

export interface WorkflowTask {
  taskId: string;
  taskType: string;
  intent: string;
  currentStep: string;
  completedSteps: string[];
  stateVersion: number;
  dataReferences: string[];
  agentState: AgentState;
  lastCheckpoint: number;
  plan: PlanStep[];
  employerApproval?: EmployerApproval;
  grievanceType?: string;
  phases?: Phase[];
  currentPhaseIndex?: number;
}

interface WorkflowState {
  activeTasks: Record<string, WorkflowTask>;
  completedTasks: WorkflowTask[];
  currentTaskId: string | null;
  
  startTask: (intent: string, taskType: string, plan: WorkflowTask['plan'], phases?: Phase[]) => string;
  updateTaskState: (taskId: string, updates: Partial<WorkflowTask>) => void;
  checkpointTask: (taskId: string, completedStep: string, nextStep: string) => void;
  completeCurrentPhase: (taskId: string) => void;
  getCurrentPhase: (taskId: string) => Phase | null;
  resumeTask: (taskId: string) => void;
  clearTask: (taskId: string) => void;
  clearAllTasks: () => void;
  archiveTask: (taskId: string) => void;
  getCurrentTask: () => WorkflowTask | null;
}

const generateId = () => crypto.randomUUID();

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      activeTasks: {},
      completedTasks: [],
      currentTaskId: null,

      startTask: (intent, taskType, plan, phases) => {
        const taskId = generateId();
        const newTask: WorkflowTask = {
          taskId,
          taskType,
          intent,
          currentStep: plan[0].step,
          completedSteps: [],
          stateVersion: 1,
          dataReferences: [],
          agentState: 'planned',
          lastCheckpoint: Date.now(),
          plan,
          ...(phases && phases.length > 0 ? { phases, currentPhaseIndex: 0 } : {}),
        };

        set(state => ({
          activeTasks: { ...state.activeTasks, [taskId]: newTask },
          currentTaskId: taskId
        }));

        return taskId;
      },

      updateTaskState: (taskId, updates) => {
        set(state => {
          const task = state.activeTasks[taskId];
          if (!task) return state;
          
          return {
            activeTasks: {
              ...state.activeTasks,
              [taskId]: { ...task, ...updates, stateVersion: task.stateVersion + 1, lastCheckpoint: Date.now() }
            }
          };
        });
      },

      checkpointTask: (taskId, completedStep, nextStep) => {
        set(state => {
          const task = state.activeTasks[taskId];
          if (!task) return state;

          const updatedPlan = task.plan.map(p => 
            p.step === completedStep ? { ...p, status: 'completed' as const } :
            p.step === nextStep ? { ...p, status: 'active' as const } : p
          );

          return {
            activeTasks: {
              ...state.activeTasks,
              [taskId]: {
                ...task,
                currentStep: nextStep,
                completedSteps: [...task.completedSteps, completedStep],
                plan: updatedPlan,
                stateVersion: task.stateVersion + 1,
                lastCheckpoint: Date.now()
              }
            }
          };
        });
      },

      completeCurrentPhase: (taskId) => {
        set(state => {
          const task = state.activeTasks[taskId];
          if (!task?.phases || task.currentPhaseIndex === undefined) return state;

          const updatedPhases = task.phases.map((p, i) => {
            if (i === task.currentPhaseIndex) return { ...p, status: 'completed' as const };
            if (i === task.currentPhaseIndex! + 1) return { ...p, status: 'active' as const };
            return p;
          });

          const nextPhaseIndex = task.currentPhaseIndex + 1;
          const nextPhase = updatedPhases[nextPhaseIndex];

          if (!nextPhase) {
            return {
              activeTasks: {
                ...state.activeTasks,
                [taskId]: {
                  ...task,
                  phases: updatedPhases,
                  currentPhaseIndex: nextPhaseIndex,
                  agentState: 'completed',
                  stateVersion: task.stateVersion + 1,
                  lastCheckpoint: Date.now(),
                }
              }
            };
          }

          const firstStepOfNextPhase = task.plan.find(p => p.step.startsWith(`phase${nextPhaseIndex}_`))?.step;

          return {
            activeTasks: {
              ...state.activeTasks,
              [taskId]: {
                ...task,
                phases: updatedPhases,
                currentPhaseIndex: nextPhaseIndex,
                plan: task.plan.map(p => ({
                  ...p,
                  status: p.step === firstStepOfNextPhase ? 'active' as const : p.status,
                })),
                currentStep: firstStepOfNextPhase || task.currentStep,
                completedSteps: [...task.completedSteps], // Don't clear completed steps to preserve history
                stateVersion: task.stateVersion + 1,
                lastCheckpoint: Date.now(),
              }
            }
          };
        });
      },

      getCurrentPhase: (taskId) => {
        const task = get().activeTasks[taskId];
        if (!task?.phases || task.currentPhaseIndex === undefined) return null;
        return task.phases[task.currentPhaseIndex] || null;
      },

      resumeTask: (taskId) => {
        set({ currentTaskId: taskId });
      },

      clearTask: (taskId) => {
        set(state => {
          const newTasks = { ...state.activeTasks };
          delete newTasks[taskId];
          return {
            activeTasks: newTasks,
            currentTaskId: state.currentTaskId === taskId ? null : state.currentTaskId
          };
        });
      },

      clearAllTasks: () => {
        set({ activeTasks: {}, completedTasks: [], currentTaskId: null });
      },

      archiveTask: (taskId) => {
        set(state => {
          const task = state.activeTasks[taskId];
          if (!task) return state;
          const newTasks = { ...state.activeTasks };
          delete newTasks[taskId];
          return {
            activeTasks: newTasks,
            completedTasks: [task, ...state.completedTasks],
            currentTaskId: state.currentTaskId === taskId ? null : state.currentTaskId
          };
        });
      },

      getCurrentTask: () => {
        const { currentTaskId, activeTasks } = get();
        return currentTaskId ? activeTasks[currentTaskId] : null;
      }
    }),
    {
      name: 'epfo-workflow-checkpoints',
    }
  )
);
