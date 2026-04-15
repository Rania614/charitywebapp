import type { User } from "@/types/domain";

function apiBase(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const b = (raw || "http://localhost:4000").replace(/\/$/, "");
  return b;
}

export function getApiBase(): string {
  return apiBase();
}

export function getToken(): string | null {
  return localStorage.getItem("healthcare_token");
}

export function setAuthSession(token: string, user: User): void {
  localStorage.setItem("healthcare_token", token);
  localStorage.setItem("healthcare_user", JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem("healthcare_token");
  localStorage.removeItem("healthcare_user");
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${apiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const t = getToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : res.statusText;
    throw new Error(msg || "فشل الطلب");
  }

  return data as T;
}
