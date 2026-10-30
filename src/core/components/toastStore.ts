import { createStore } from 'zustand/vanilla';

export type Toast = {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export type ToastState = {
  toast: Toast | null;
  show: (message: string, action?: { label: string; onPress: () => void }) => void;
  performAction: () => void;
  dismiss: () => void;
};

export type ToastStore = ReturnType<typeof createToastStore>;

export const TOAST_DURATION_MS = 4_000;

/** Snackbar-style messages with an optional action (used for undo). */
export const createToastStore = () => {
  let nextId = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  return createStore<ToastState>()((set, get) => ({
    toast: null,
    show: (message, action) => {
      const id = ++nextId;
      clearTimeout(timer);
      set({ toast: { id, message, actionLabel: action?.label, onAction: action?.onPress } });
      timer = setTimeout(() => {
        if (get().toast?.id === id) {
          set({ toast: null });
        }
      }, TOAST_DURATION_MS);
    },
    performAction: () => {
      get().toast?.onAction?.();
      get().dismiss();
    },
    dismiss: () => {
      clearTimeout(timer);
      set({ toast: null });
    },
  }));
};
