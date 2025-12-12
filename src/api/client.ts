const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let initData: string | null = null;

export function setInitData(data: string) {
  initData = data;
}

export function getInitData(): string | null {
  return initData;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Add auth header if available
  if (!skipAuth && initData) {
    (headers as Record<string, string>)["Authorization"] = `tma ${initData}`;
  }

  // For development, use X-Telegram-Id if no initData
  if (!skipAuth && !initData && import.meta.env.DEV) {
    const telegramId = localStorage.getItem("dev_telegram_id");
    if (telegramId) {
      (headers as Record<string, string>)["X-Telegram-Id"] = telegramId;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
};
