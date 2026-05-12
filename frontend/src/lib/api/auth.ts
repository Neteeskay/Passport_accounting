import { ApiError, apiRequest } from "@/lib/api/client";
import type { LoginFormValues } from "@/lib/validation/auth";
import type { User, UserRole } from "@/types/user";

type ApiUser = {
  id?: string | number;
  login?: string;
  username?: string;
  role?: UserRole;
  fullName?: string;
  full_name?: string;
  name?: string;
  createdAt?: string;
  created_at?: string;
};

type LoginResponse = {
  access_token?: string;
  accessToken?: string;
  auth_token?: string;
  token?: string;
  token_type?: string;
  expires_in?: number;
  user?: ApiUser;
  data?: LoginResponse;
};

export async function checkServiceHealth() {
  return apiRequest<{ status?: string }>("/health", {
    authMode: "none"
  });
}

export async function checkSystemHealth() {
  return apiRequest<{ status?: string }>("/api/v1/system/health", {
    authMode: "none"
  });
}

export async function loginByPassword(values: LoginFormValues) {
  const response = await apiRequest<LoginResponse>("/api/v1/auth/login", {
    authMode: "none",
    method: "POST",
    data: toLoginPayload(values)
  });
  const data = unwrapLoginResponse(response);
  const token = data.access_token ?? data.accessToken ?? data.auth_token ?? data.token ?? null;
  const user = data.user ? normalizeUser(data.user) : await getCurrentUser(token);

  return { token, user };
}

function unwrapLoginResponse(response: LoginResponse) {
  return response.data ?? response;
}

export async function getCurrentUser(token?: string | null) {
  assertToken(token);

  const data = await apiRequest<ApiUser>("/api/v1/auth/me", {
    token
  });

  return normalizeUser(data);
}

export async function logoutSession(token?: string | null) {
  assertToken(token);

  await apiRequest<void>("/api/v1/auth/logout", {
    method: "POST",
    token
  });
}

function toLoginPayload(values: LoginFormValues) {
  return {
    username: values.login,
    password: values.password
  };
}

function assertToken(token?: string | null) {
  if (!token) {
    throw new ApiError("Не найден токен авторизации", 401);
  }
}

function normalizeUser(user: ApiUser): User {
  const login = user.login ?? user.username ?? "";
  const role = user.role === "operator" ? "operator" : "admin";

  return {
    id: String(user.id ?? login),
    login,
    role,
    fullName: user.fullName ?? user.full_name ?? user.name ?? roleLabel(role),
    createdAt: user.createdAt ?? user.created_at ?? new Date().toISOString()
  };
}

function roleLabel(role: UserRole) {
  return role === "operator" ? "Оператор" : "Администратор";
}
