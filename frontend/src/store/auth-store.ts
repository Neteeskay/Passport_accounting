"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "@/lib/auth/token-storage";
import type { User } from "@/types/user";

type AuthState = {
  hasHydrated: boolean;
  token: string | null;
  user: User | null;
  login: (user: User, token?: string | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      token: null,
      user: null,
      login: (user, token = null) => set({ user, token }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null })
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        token: state.token,
        user: state.user
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
