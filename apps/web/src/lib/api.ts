const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "colo_token";
export const AUTH_CHANGED_EVENT = "colo-auth-changed";

export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

function notifyAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChanged();
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  notifyAuthChanged();
}

interface ApiError {
  erro?: string;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(apiUrl(path), { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as T & ApiError;
  if (res.status === 401 && token) clearToken();
  if (!res.ok) {
    throw new Error(data.erro || "Ocorreu um erro. Tenta novamente.");
  }
  return data;
}
