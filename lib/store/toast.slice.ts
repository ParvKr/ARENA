// lib/store/toast.slice.ts
// Capped, deduplicated toast alert processing queue for real-time state tracking.
import { StateCreator } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'rankup';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  priority: number; // Higher numbers override or sort to top of presentation queue
}

export interface ToastSlice {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const MAX_TOASTS = 4;

export const createToastSlice: StateCreator<ToastSlice, [], [], ToastSlice> = (set, get) => ({
  toasts: [],
  addToast: (incoming) => {
    const currentToasts = get().toasts;

    // Guard 1: Anti-Spam / Real-time Loop Deduplication
    const isDuplicate = currentToasts.some(
      (t) => t.message === incoming.message && t.type === incoming.type
    );
    if (isDuplicate) return;

    const id = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...incoming, id };

    // Guard 2: Strict Priority Ordering & Fixed Memory Footprint Array Slice
    const updatedToasts = [...currentToasts, newToast]
      .sort((a, b) => b.priority - a.priority)
      .slice(-MAX_TOASTS);

    set({ toasts: updatedToasts });

    // Automated cleanup loop driven natively per individual duration thresholds
    setTimeout(() => {
      get().removeToast(id);
    }, incoming.duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
});