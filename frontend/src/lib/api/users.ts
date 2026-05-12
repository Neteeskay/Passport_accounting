import { apiRequest } from "@/lib/api/client";
import type { User, UserRole } from "@/types/user";

type ApiUser = {
  id?: string | number;
  username?: string;
  login?: string;
  full_name?: string;
  fullName?: string;
  role?: UserRole;
  created_at?: string;
  createdAt?: string;
};

export type CreateUserPayload = {
  login: string;
  fullName: string;
  password: string;
  role: UserRole;
};

export async function createAuthUser(payload: CreateUserPayload, token?: string | null) {
  const data = await apiRequest<ApiUser>("/api/v1/auth/users", {
    method: "POST",
    token,
    data: {
      username: payload.login.trim(),
      password: payload.password,
      full_name: payload.fullName.trim(),
      role: payload.role
    }
  });

  return normalizeUser(data);
}

function normalizeUser(user: ApiUser): User {
  const login = user.username ?? user.login ?? "";
  const role = user.role === "admin" ? "admin" : "operator";

  return {
    id: String(user.id ?? login),
    login,
    role,
    fullName: user.full_name ?? user.fullName ?? login,
    createdAt: user.created_at ?? user.createdAt ?? new Date().toISOString()
  };
}
