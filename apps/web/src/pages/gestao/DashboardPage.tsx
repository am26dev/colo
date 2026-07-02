import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { fmtIntervaloSemana } from "../../utils/format";
import type { DashboardSummary } from "../../types";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    api<DashboardSummary>("/api/dashboard/summary").then(setSummary);
  }, []);

  if (!summary) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-[var(--primary)]/10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const semana = summary.semanaAtiva;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "Georgia, serif" }}>Dashboard</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">Resumo da semana activa e dos pedidos.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Semana activa</span>
            <span className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>
              {semana ? fmtIntervaloSemana(semana.dataInicio, semana.dataFim) : "Nenhuma"}
            </span>
            {semana && (
              <Badge variant={semana.estado === "aberto" ? "sage" : "destructive"} className="self-start">
                {semana.estado === "aberto" ? "🟢 Aberto" : semana.estado === "oculto" ? "⚫ Oculto" : "🔴 Fechado"}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Vagas restantes</span>
            <span className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>
              {semana ? `${semana.vagasRestantes} / ${semana.vagasTotais}` : "—"}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Pedidos desta semana</span>
            <span className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>
              {summary.pedidosSemanaAtiva}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Pedidos por confirmar</span>
            <span className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>
              {summary.pedidosNovos}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 mt-6">
        <Button asChild>
          <Link to="/gestao/pedidos">Ver pedidos</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/gestao/semanas">Gerir semanas</Link>
        </Button>
      </div>
    </div>
  );
}
