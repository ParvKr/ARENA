// lib/store/ui.slice.ts
// Handles persistent user preferences safely synchronized across Next.js SSR boundaries.
import { StateCreator } from 'zustand';

export interface UiSlice {
  soundEnabled: boolean;
  reducedMotion: boolean;
  hasHydrated: boolean;
  toggleSound: () => void;
  toggleMotion: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set, get) => ({
  soundEnabled: false,
  reducedMotion: false,
  hasHydrated: false,
  toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
  toggleMotion: () => set({ reducedMotion: !get().reducedMotion }),
  setHasHydrated: (state) => set({ hasHydrated: state }),
});