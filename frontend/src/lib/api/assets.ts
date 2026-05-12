import { API_BASE_URL } from "@/lib/api/config";

export function resolveApiAssetUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  if (value.startsWith("data:") || value.startsWith("blob:") || /^https?:\/\//.test(value)) {
    return value;
  }

  return `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}
