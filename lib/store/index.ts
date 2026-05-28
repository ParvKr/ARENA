// lib/store/index.ts
// Unified global store access gatehouse for Project Arena full-stack interfaces.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createToastSlice, ToastSlice } from './toast.slice';
import { createUiSlice, UiSlice } from './ui.slice';
import { createAuthSlice, AuthSlice } from './auth.slice';

// Merge all slice signatures into a single unified composite store type
type CombinedStore = ToastSlice & UiSlice & AuthSlice;

export const useArenaStore = create<CombinedStore>()(
  persist(
    (...a) => ({
      ...createToastSlice(...a),
      ...createUiSlice(...a),
      ...createAuthSlice(...a), // Mount your auth slice properties into the state tree
    }),
    {
      name: 'arena-ui-ledger',
      // Explicitly whitelist keys safe for browser local storage persist tracking
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        reducedMotion: state.reducedMotion,
        // Keep user sessions out of local storage; Supabase cookies manage auth auth securely
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ── Production Convenience Hooks ──────────────────────────────────────────
export const useToast = () => {
  const addToast = useArenaStore((state) => state.addToast);

  return {
    success: (message: string) => addToast({ type: 'success', message, duration: 4000, priority: 1 }),
    error: (message: string) => addToast({ type: 'error', message, duration: 6000, priority: 3 }),
    warning: (message: string) => addToast({ type: 'warning', message, duration: 5000, priority: 2 }),
    info: (message: string) => addToast({ type: 'info', message, duration: 4000, priority: 1 }),
    achievement: (message: string) => addToast({ type: 'achievement', message, duration: 8000, priority: 4 }),
    rankup: (message: string) => addToast({ type: 'rankup', message, duration: 6000, priority: 5 }),
  };
};