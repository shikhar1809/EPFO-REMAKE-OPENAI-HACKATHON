import { create } from 'zustand';

export type ServerHealthState = 'healthy' | 'medium' | 'heavy';

interface ServerStatusStore {
  status: ServerHealthState;
  latencyMs: number;
  isManualOverride: boolean;
  setStatus: (status: ServerHealthState, isManual?: boolean) => void;
  resetToHealthy: () => void;
}

// Clean up any legacy localStorage entry
try {
  localStorage.removeItem('epfo-server-status');
} catch (e) {
  // ignore
}

export const useServerStatusStore = create<ServerStatusStore>((set) => ({
  status: 'healthy',
  latencyMs: 42,
  isManualOverride: false,
  setStatus: (status: ServerHealthState, isManual = true) => {
    const latencyMs = status === 'healthy' ? 42 : status === 'medium' ? 480 : 2450;
    set({ status, latencyMs, isManualOverride: isManual });
  },
  resetToHealthy: () => {
    set({ status: 'healthy', latencyMs: 42, isManualOverride: false });
  }
}));
