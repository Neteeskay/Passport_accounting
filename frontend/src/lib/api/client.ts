import axios, { type AxiosRequestConfig } from "axios";
import { API_BASE_URL, API_WITH_CREDENTIALS } from "@/lib/api/config";

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
  withCredentials: API_WITH_CREDENTIALS,
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
    if (axios.isAxiosError(error)) {
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

function readAxiosErrorMessage(error: unknown) {
  const data = axios.isAxiosError(error)
    ? (error.response?.data as { detail?: string | Array<{ msg?: string }>; message?: string } | string | undefined)
    : undefined;

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).filter(Boolean).join(". ") || "Ошибка валидации запроса";
  }

  return data?.detail ?? data?.message ?? "Ошибка запроса";
}
