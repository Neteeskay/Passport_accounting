import { apiRequest } from "@/lib/api/client";

export type SystemAccessResponse = {
  status?: string;
  message?: string;
};

export async function checkAuthenticatedSession(token?: string | null) {
  return apiRequest<SystemAccessResponse>("/api/v1/system/session", {
    method: "GET",
    token
  });
}

export async function checkAdminSession(token?: string | null) {
  return apiRequest<SystemAccessResponse>("/api/v1/system/admin", {
    method: "GET",
    token
  });
}
