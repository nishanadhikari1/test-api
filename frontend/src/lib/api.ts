import { getCookie } from "./cookies";

const apiUrl = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const endpoint = apiUrl + path;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const method = options.method;
  if (method !== "GET" && method !== undefined) {
    headers["X-CSRF-Token"] = getCookie("csrfToken") ?? "";
  }

  const response = await fetch(endpoint, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error ?? `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}