export const AUTH_STORAGE_KEY = "passport-auth";

type PersistedAuthState = {
  state?: {
    token?: unknown;
  };
};

export function readPersistedAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as PersistedAuthState;
    const token = parsedValue.state?.token;

    return typeof token === "string" && token.trim() ? token : null;
  } catch {
    return null;
  }
}

