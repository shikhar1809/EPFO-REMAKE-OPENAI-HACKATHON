import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AgentState = 
  | 'idle' 
  | 'planned' 
  | 'in_progress' 
  | 'needs_user' 
  | 'sensitive_action' 
  | 'completed' 
  | 'failed' 
  | 'recoverable';

export interface WorkflowTask {
  taskId: string;
  taskType: string;
  intent: string;
  currentStep: string;
  completedSteps: string[];
  stateVersion: number;
  dataReferences: string[]; // Vault references
  agentState: AgentState;
  lastCheckpoint: number; // Timestamp
  plan: { step: string; description: string; status: 'pending' | 'active' | 'completed' }[];
}

interface WorkflowState {
  activeTasks: Record<string, WorkflowTask>;
  completedTasks: WorkflowTask[];
  currentTaskId: string | null;
  
  // Actions
  startTask: (intent: string, taskType: string, plan: WorkflowTask['plan']) => string;
  updateTaskState: (taskId: string, updates: Partial<WorkflowTask>) => void;
  checkpointTask: (taskId: string, completedStep: string, nextStep: string) => void;
  resumeTask: (taskId: string) => void;
  clearTask: (taskId: string) => void;
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

      startTask: (intent, taskType, plan) => {
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
          plan
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
