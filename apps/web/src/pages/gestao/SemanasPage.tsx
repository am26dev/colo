import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { fmtIntervaloSemana, fmtPreco } from "../../utils/format";
import type { SiteConfig, WeekListItem } from "../../types";

export default function SemanasPage() {
  const [weeks, setWeeks] = useState<WeekListItem[] | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [flash, setFlash] = useState<{ msg: string; tipo: "ok" | "erro" } | null>(null);

  function carregar() {
    api<{ weeks: WeekListItem[] }>("/api/weeks").then((d) => setWeeks(d.weeks));
    api<{ config: SiteConfig }>("/api/site").then((d) => setConfig(d.config));
  }

  useEffect(carregar, []);

  async function alternarModo() {
    if (!config) return;
    const novoConfig = { ...config, modoAutomaticoSemanas: !config.modoAutomaticoSemanas };
    await api("/api/config", { method: "PUT", body: JSON.stringify(novoConfig) });
    setConfig(novoConfig);
  }

  async function ativar(id: string) {
    await api(`/api/weeks/${id}/ativar`, { method: "POST" });
    setFlash({ msg: "Semana activada.", tipo: "ok" });
    carregar();
  }

  async function eliminar(id: string) {
    try {
      await api(`/api/weeks/${id}`, { method: "DELETE" });
      carregar();
    } catch (err) {
      setFlash({ msg: err instanceof Error ? err.message : "Erro ao eliminar.", tipo: "erro" });
    }
  }

  if (!weeks || !config) {
    return <p>A carregar…</p>;
  }

  return (
    <div>
      <h1>Semanas</h1>
      <p className="sub">Cria e gere os menus semanais. Tu defines o intervalo de datas de cada semana.</p>

      {flash && <div className={`flash ${flash.tipo}`}>{flash.msg}</div>}

      <div className="card">
        <div className="estado-box">
          <div>
            <strong>{config.modoAutomaticoSemanas ? "Modo automático" : "Modo manual"}</strong>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              {config.modoAutomaticoSemanas
                ? "O site mostra sozinho a semana cujas datas incluem hoje."
                : "Activa manualmente a semana que queres mostrar no site."}
            </p>
          </div>
          <button type="button" className="btn ghost" onClick={alternarModo}>
            Mudar para {config.modoAutomaticoSemanas ? "manual" : "automático"}
          </button>
        </div>
      </div>

      <div className="actions" style={{ margin: "18px 0" }}>
        <Link className="btn" to="/gestao/semanas/nova">
          + Nova semana
        </Link>
      </div>

      {weeks.length === 0 ? (
        <p className="muted">Ainda não criaste nenhuma semana.</p>
      ) : (
        <div className="semanas-lista">
          {weeks.map((w) => (
            <div className="card semana-item" key={w.id}>
              <div className="semana-item-head">
                <strong>{fmtIntervaloSemana(w.dataInicio, w.dataFim)}</strong>
                <span className={`estado-pill ${w.estado === "aberto" ? "aberto" : "fechado"}`}>
                  {w.estado === "aberto" ? "🟢 Aberto" : w.estado === "oculto" ? "⚫ Oculto" : "🔴 Fechado"}
                </span>
                {w.ativaManual && !config.modoAutomaticoSemanas && <span className="tag">activa</span>}
              </div>
              <p className="muted">
                {fmtPreco(w.precoSemanal, config.moeda)} · {w.vagasRestantes}/{w.vagasTotais} vagas ·{" "}
                {w._count?.pedidos ?? 0} pedido(s)
              </p>
              <div className="actions">
                <Link className="btn ghost sm" to={`/gestao/semanas/${w.id}`}>
                  Editar
                </Link>
                {!config.modoAutomaticoSemanas && (
                  <button type="button" className="btn sage sm" onClick={() => ativar(w.id)} disabled={w.ativaManual}>
                    {w.ativaManual ? "Activa" : "Tornar activa"}
                  </button>
                )}
                <button type="button" className="del" onClick={() => eliminar(w.id)}>
                  eliminar ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
