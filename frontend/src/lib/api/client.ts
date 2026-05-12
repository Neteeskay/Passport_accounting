import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/lib/api/config";

type ApiRequestOptions = Omit<AxiosRequestConfig, "baseURL" | "url"> & {
  body?: BodyInit | null;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json"
  }
});

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  try {
    const { body, token, headers, ...config } = options;
    const response = await apiClient.request<T>({
      ...config,
      url: path,
      data: normalizeBody(body, config.data),
      headers: {
        ...(headers as Record<string, string> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(readAxiosErrorMessage(error), error.response?.status ?? 0);
    }

    throw error;
  }
}

function normalizeBody(body: BodyInit | null | undefined, data: unknown) {
  if (typeof data !== "undefined") {
    return data;
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  return body;
}

function readAxiosErrorMessage(error: AxiosError) {
  const data = error.response?.data as { detail?: string; message?: string } | string | undefined;

  if (typeof data === "string") {
    return data;
  }

  return data?.detail ?? data?.message ?? "Ошибка запроса";
}
