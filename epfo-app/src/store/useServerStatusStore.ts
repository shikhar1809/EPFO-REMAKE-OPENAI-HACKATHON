import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ServerHealthState = 'healthy' | 'medium' | 'heavy';

interface ServerStatusStore {
  status: ServerHealthState;
  latencyMs: number;
  setStatus: (status: ServerHealthState) => void;
  cycleStatus: () => void;
}

export const useServerStatusStore = create<ServerStatusStore>()(
  persist(
    (set, get) => ({
      status: 'healthy',
      latencyMs: 42,
      setStatus: (status: ServerHealthState) => {
        const latencyMs = status === 'healthy' ? 42 : status === 'medium' ? 480 : 2450;
        set({ status, latencyMs });
      },
      cycleStatus: () => {
        const current = get().status;
        if (current === 'healthy') {
          set({ status: 'medium', latencyMs: 480 });
        } else if (current === 'medium') {
          set({ status: 'heavy', latencyMs: 2450 });
        } else {
          set({ status: 'healthy', latencyMs: 42 });
        }
      }
    }),
    {
      name: 'epfo-server-status'
    }
  )
);
