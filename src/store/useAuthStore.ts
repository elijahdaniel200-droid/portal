import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | null;

interface AuthState {
  user: User | null;
  role: UserRole;
  profile: any | null;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  setProfile: (profile: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  profile: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setProfile: (profile) => set({ profile }),
  clearAuth: () => set({ user: null, role: null, profile: null }),
}));
