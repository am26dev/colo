import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { fmtIntervaloSemana } from "../../utils/format";
import type { DashboardSummary } from "../../types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api<DashboardSummary>("/api/dashboard/summary").then(setSummary);
  }, []);

  if (!summary) {
    return <p>A carregar…</p>;
  }

  const semana = summary.semanaAtiva;

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="sub">Resumo da semana activa e dos pedidos.</p>

      <div className="dashboard-cards">
        <div className="card dashboard-card">
          <span className="dashboard-card-label">Semana activa</span>
          <span className="dashboard-card-valor">
            {semana ? fmtIntervaloSemana(semana.dataInicio, semana.dataFim) : "Nenhuma"}
          </span>
          {semana && (
            <span className={`estado-pill ${semana.estado === "aberto" ? "aberto" : "fechado"}`}>
              {semana.estado === "aberto" ? "🟢 Aberto" : semana.estado === "oculto" ? "⚫ Oculto" : "🔴 Fechado"}
            </span>
          )}
        </div>

        <div className="card dashboard-card">
          <span className="dashboard-card-label">Vagas restantes</span>
          <span className="dashboard-card-valor">
            {semana ? `${semana.vagasRestantes} / ${semana.vagasTotais}` : "—"}
          </span>
        </div>

        <div className="card dashboard-card">
          <span className="dashboard-card-label">Pedidos desta semana</span>
          <span className="dashboard-card-valor">{summary.pedidosSemanaAtiva}</span>
        </div>

        <div className="card dashboard-card">
          <span className="dashboard-card-label">Pedidos por confirmar</span>
          <span className="dashboard-card-valor">{summary.pedidosNovos}</span>
        </div>
      </div>

      <div className="actions" style={{ marginTop: 18 }}>
        <Link className="btn" to="/gestao/pedidos">
          Ver pedidos
        </Link>
        <Link className="btn ghost" to="/gestao/semanas">
          Gerir semanas
        </Link>
      </div>
    </div>
  );
}
