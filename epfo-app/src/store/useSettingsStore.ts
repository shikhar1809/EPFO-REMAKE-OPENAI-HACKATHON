import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  lowInternetMode: boolean;
  setLowInternetMode: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      lowInternetMode: false,
      setLowInternetMode: (val) => set({ lowInternetMode: val }),
    }),
    {
      name: 'epfo-settings',
    }
  )
);

