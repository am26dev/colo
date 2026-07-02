import { useEffect, useState } from "react";
import { defaultConfig, defaultWeek } from "../data/data";
import { api } from "../lib/api";
import type { SitePayload } from "../types";

/**
 * Tenta obter config+semana activa da API; se falhar (ou demorar demasiado),
 * cai para os defaults de data.ts — mesmo padrão do boot() do app.js original.
 */
export function useSiteContent(): SitePayload & { loading: boolean } {
  const [payload, setPayload] = useState<SitePayload>({
    config: defaultConfig,
    week: defaultWeek,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = false;
    const finish = (data?: SitePayload) => {
      if (done) return;
      done = true;
      if (data) setPayload(data);
      setLoading(false);
    };
    const timer = setTimeout(() => finish(), 2500);

    api<SitePayload>("/api/site")
      .then((data) => {
        clearTimeout(timer);
        finish(data);
      })
      .catch(() => {
        clearTimeout(timer);
        finish();
      });

    return () => clearTimeout(timer);
  }, []);

  return { ...payload, loading };
}
