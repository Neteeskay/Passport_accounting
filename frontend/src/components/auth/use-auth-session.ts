"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser, logoutSession } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";

type UseAuthSessionOptions = {
  redirectOnUnauthorized?: boolean;
};

export function useAuthSession({ redirectOnUnauthorized = false }: UseAuthSessionOptions = {}) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser(token);
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();

        if (redirectOnUnauthorized) {
          router.push("/login");
        }
      }
    }
  }, [logout, redirectOnUnauthorized, router, setUser, token]);

  const endSession = useCallback(async () => {
    try {
      await logoutSession(token);
    } finally {
      logout();
      router.push("/login");
    }
  }, [logout, router, token]);

  useEffect(() => {
    void refreshCurrentUser();
  }, [refreshCurrentUser]);

  return {
    endSession,
    refreshCurrentUser,
    token,
    user
  };
}
