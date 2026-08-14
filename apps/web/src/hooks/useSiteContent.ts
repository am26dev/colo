import { useEffect, useState } from "react";
import { defaultConfig, defaultWeek } from "../data/data";
import { api } from "../lib/api";
import type { SiteConfig, SitePayload } from "../types";

type SiteApiPayload = {
  config?: Partial<SiteConfig> | null;
  week?: SitePayload["week"];
};

function normalizePayload(data: SiteApiPayload | null | undefined): SitePayload {
  const config = data?.config;

  return {
    config: {
      ...defaultConfig,
      ...(config ?? {}),
      pagamento: Array.isArray(config?.pagamento)
        ? config.pagamento
        : defaultConfig.pagamento,
    },
    // `null` significa que a API respondeu correctamente, mas não há semana activa.
    // Uma propriedade ausente indica uma resposta incompleta e usa o fallback local.
    week: data && "week" in data ? (data.week ?? null) : defaultWeek,
  };
}

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
    const finish = (data?: SiteApiPayload) => {
      if (done) return;
      done = true;
      if (data) setPayload(normalizePayload(data));
      setLoading(false);
    };
    const timer = setTimeout(() => finish(), 2500);

    api<SiteApiPayload>("/api/site")
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
