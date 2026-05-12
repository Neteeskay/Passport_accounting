import { apiRequest } from "@/lib/api/client";
import type { User, UserRole } from "@/types/user";

type ApiUser = {
  id?: string | number;
  username?: string;
  login?: string;
  full_name?: string;
  fullName?: string;
  role?: UserRole;
  is_active?: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
};

export type CreateUserPayload = {
  login: string;
  fullName: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
};

export type UpdateUserPayload = {
  login: string;
  fullName: string;
  password?: string;
  role: UserRole;
  isActive?: boolean;
};

export async function getAuthUsers(token?: string | null) {
  const data = await apiRequest<ApiUser[]>("/api/v1/auth/users", {
    method: "GET",
    token
  });

  return data.map(normalizeUser);
}

export async function createAuthUser(payload: CreateUserPayload, token?: string | null) {
  const data = await apiRequest<ApiUser>("/api/v1/auth/users", {
    method: "POST",
    token,
    data: toApiUserPayload(payload)
  });

  return normalizeUser(data);
}

export async function updateAuthUser(userId: string, payload: UpdateUserPayload, token?: string | null) {
  const data = await apiRequest<ApiUser>(`/api/v1/auth/users/${userId}`, {
    method: "PUT",
    token,
    data: toApiUserPayload(payload)
  });

  return normalizeUser(data);
}

export async function deleteAuthUser(userId: string, token?: string | null) {
  await apiRequest<void>(`/api/v1/auth/users/${userId}`, {
    method: "DELETE",
    token
  });
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

function toApiUserPayload(payload: CreateUserPayload | UpdateUserPayload) {
  return {
    username: payload.login.trim(),
    ...(payload.password ? { password: payload.password } : {}),
    full_name: payload.fullName.trim(),
    role: payload.role,
    is_active: payload.isActive ?? true
  };
}
