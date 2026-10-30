import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import { KeyValueStore } from '@/core/storage/keyValueStore';

export const THEMES = ['system', 'light', 'dark'] as const;
export const LANGUAGES = ['system', 'en', 'sr'] as const;

export type AppTheme = (typeof THEMES)[number];
export type AppLanguage = (typeof LANGUAGES)[number];

export type SettingsState = {
  theme: AppTheme;
  /** First launch is in English; an explicit "System" choice is remembered. */
  language: AppLanguage;
  setTheme: (theme: AppTheme) => void;
  setLanguage: (language: AppLanguage) => void;
};

export type SettingsStore = ReturnType<typeof createSettingsStore>;

export const createSettingsStore = (storage: KeyValueStore) =>
  createStore<SettingsState>()(
    persist(
      (set) => ({
        theme: 'system',
        language: 'en',
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
      }),
      {
        name: 'settings',
        storage: createJSONStorage(() => storage),
        partialize: ({ theme, language }) => ({ theme, language }),
      },
    ),
  );
