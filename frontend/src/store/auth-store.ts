"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

type AuthState = {
  token: string | null;
  user: User | null;
  login: (user: User, token?: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (user, token = null) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null })
    }),
    {
      name: "passport-auth"
    }
  )
);
