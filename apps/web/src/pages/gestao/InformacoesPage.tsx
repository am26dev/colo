import { useEffect, useState } from "react";
import { InfoCard } from "../../components/gestao/InfoCard";
import { api } from "../../lib/api";
import type { SiteConfig } from "../../types";

export default function InformacoesPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [flash, setFlash] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);

  function carregar() {
    api<{ config: SiteConfig }>("/api/site").then((d) => setConfig(d.config));
  }

  useEffect(carregar, []);

  if (!config) {
    return <p>A carregar…</p>;
  }

  return (
    <div>
      {flash && <div className={`flash ${flash.tipo}`}>{flash.msg}</div>}
      <InfoCard
        config={config}
        onSaved={(msg) => {
          setFlash({ msg, tipo: "ok" });
          carregar();
        }}
        onError={(msg) => setFlash({ msg, tipo: "erro" })}
      />
    </div>
  );
}
