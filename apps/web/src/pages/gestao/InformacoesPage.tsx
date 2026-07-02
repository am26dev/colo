import { useEffect, useState } from "react";
import { InfoCard } from "../../components/gestao/InfoCard";
import { api } from "../../lib/api";
import type { SiteConfig } from "../../types";
import { toast } from "../../components/ui/sonner";

export default function InformacoesPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  function carregar() {
    api<{ config: SiteConfig }>("/api/site").then((d) => setConfig(d.config));
  }

  useEffect(carregar, []);

  if (!config) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-[var(--primary)]/10 animate-pulse" />
        <div className="h-48 rounded-xl bg-[var(--primary)]/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <InfoCard
        config={config}
        onSaved={(msg) => toast(msg, "ok")}
        onError={(msg) => toast(msg, "erro")}
      />
    </div>
  );
}
