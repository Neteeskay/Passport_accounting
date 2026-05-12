export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

export const API_WITH_CREDENTIALS = process.env.NEXT_PUBLIC_API_WITH_CREDENTIALS === "true";
