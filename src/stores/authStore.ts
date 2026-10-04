import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/app.types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // true cuando el usuario entró desde el enlace de "recuperar contraseña"
  isPasswordRecovery: boolean;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setPasswordRecovery: (value: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isPasswordRecovery: false,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
    }),

  setProfile: (profile) => set({ profile }),

  setLoading: (isLoading) => set({ isLoading }),

  setPasswordRecovery: (isPasswordRecovery) => set({ isPasswordRecovery }),

  clear: () =>
    set({
      session: null,
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      isPasswordRecovery: false,
    }),
}));
