// lib/store/auth.slice.ts
// Domain-isolated state slice handling authenticated profile tracking.
import { StateCreator } from 'zustand';
import type { Profile } from '@/types/api.types';

export interface AuthSlice {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
});