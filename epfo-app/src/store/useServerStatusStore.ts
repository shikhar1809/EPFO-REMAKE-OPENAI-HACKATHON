import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ServerHealthState = 'healthy' | 'medium' | 'heavy';

interface ServerStatusStore {
  status: ServerHealthState;
  latencyMs: number;
  isManualOverride: boolean;
  setStatus: (status: ServerHealthState, isManual?: boolean) => void;
  cycleStatus: () => void;
  resetToHealthy: () => void;
}

export const useServerStatusStore = create<ServerStatusStore>()(
  persist(
    (set, get) => ({
      status: 'healthy',
      latencyMs: 42,
      isManualOverride: false,
      setStatus: (status: ServerHealthState, isManual = true) => {
        const latencyMs = status === 'healthy' ? 42 : status === 'medium' ? 480 : 2450;
        set({ status, latencyMs, isManualOverride: isManual });
      },
      cycleStatus: () => {
        const current = get().status;
        if (current === 'healthy') {
          set({ status: 'medium', latencyMs: 480, isManualOverride: false });
        } else if (current === 'medium') {
          set({ status: 'heavy', latencyMs: 2450, isManualOverride: false });
        } else {
          set({ status: 'healthy', latencyMs: 42, isManualOverride: false });
        }
      },
      resetToHealthy: () => {
        set({ status: 'healthy', latencyMs: 42, isManualOverride: false });
      }
    }),
    {
      name: 'epfo-server-status'
    }
  )
);
