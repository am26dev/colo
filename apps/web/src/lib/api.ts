const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "colo_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiError {
  erro?: string;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as T & ApiError;
  if (!res.ok) {
    throw new Error(data.erro || "Ocorreu um erro. Tenta novamente.");
  }
  return data;
}
