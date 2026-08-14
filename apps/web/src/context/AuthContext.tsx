import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, AUTH_CHANGED_EVENT, clearToken, getToken, setToken } from "../lib/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  setup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken());

  useEffect(() => {
    const syncToken = () => setTokenState(getToken());
    window.addEventListener("storage", syncToken);
    window.addEventListener(AUTH_CHANGED_EVENT, syncToken);
    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncToken);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setTokenState(data.token);
  }, []);

  const setup = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string }>("/api/auth/setup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setTokenState(data.token);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, setup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
