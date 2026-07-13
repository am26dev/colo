import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import { getToken } from "../lib/api";
import { DEFAULT_CONTENT } from "../data/content-defaults";

type PendingChanges = Record<string, string>;

interface EditModeContextValue {
  isAdmin: boolean;
  isEditing: boolean;
  enterEdit: () => void;
  exitEdit: () => void;
  content: Record<string, string>;
  get: (key: string) => string;
  setPending: (key: string, value: string) => void;
  pending: PendingChanges;
  hasPending: boolean;
  save: () => Promise<{ ok: boolean; error?: string }>;
  discard: () => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<EditModeContextValue | null>(null);

export function useEditMode() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEditMode must be used inside <EditModeProvider>");
  return v;
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [hasToken, setHasToken] = useState(!!getToken());
  const [isEditing, setIsEditing] = useState(false);
  const [dbContent, setDbContent] = useState<Record<string, string>>({});
  const [pending, setPendingState] = useState<PendingChanges>({});
  const [loading, setLoading] = useState(true);

  const merged = useMemo(
    () => ({ ...DEFAULT_CONTENT, ...dbContent, ...pending }),
    [dbContent, pending],
  );

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ content: Record<string, string> }>("/api/edit-content");
      setDbContent(data.content ?? {});
    } catch {
      // fallback to defaults
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setHasToken(!!getToken());
      setLoading(false);
    })();
    const check = () => setHasToken(!!getToken());
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, [refresh]);

  const setPending = useCallback((key: string, value: string) => {
    setPendingState((p) => ({ ...p, [key]: value }));
  }, []);

  const discard = useCallback(() => {
    setPendingState({});
  }, []);

  const save = useCallback(async () => {
    if (Object.keys(pending).length === 0) return { ok: true };
    try {
      await api("/api/edit-content", {
        method: "PUT",
        body: JSON.stringify({ changes: pending }),
      });
      setDbContent((c) => ({ ...c, ...pending }));
      setPendingState({});
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Erro ao guardar" };
    }
  }, [pending]);

  const value: EditModeContextValue = {
    isAdmin: hasToken,
    isEditing,
    enterEdit: () => setIsEditing(true),
    exitEdit: () => {
      setIsEditing(false);
      setPendingState({});
    },
    content: merged,
    get: (k) => merged[k] ?? DEFAULT_CONTENT[k] ?? "",
    setPending,
    pending,
    hasPending: Object.keys(pending).length > 0,
    save,
    discard,
    loading,
    refresh,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
