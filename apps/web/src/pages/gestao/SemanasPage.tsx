import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { fmtIntervaloSemana, fmtPreco } from "../../utils/format";
import type { SiteConfig, WeekListItem } from "../../types";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { toast } from "../../components/ui/sonner";

export default function SemanasPage() {
  const [weeks, setWeeks] = useState<WeekListItem[] | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    toast(`Modo ${novoConfig.modoAutomaticoSemanas ? "automático" : "manual"} activado.`, "ok");
  }

  async function ativar(id: string) {
    await api(`/api/weeks/${id}/ativar`, { method: "POST" });
    toast("Semana activada.", "ok");
    carregar();
  }

  async function eliminar(id: string) {
    try {
      await api(`/api/weeks/${id}`, { method: "DELETE" });
      setDeleteId(null);
      carregar();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao eliminar.", "erro");
      setDeleteId(null);
    }
  }

  if (!weeks || !config) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-[var(--primary)]/10 animate-pulse" />
        <Card><CardContent className="p-4 space-y-3"><Skeleton className="h-6 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "Georgia, serif" }}>Semanas</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">Cria e gere os menus semanais. Tu defines o intervalo de datas de cada semana.</p>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm">{config.modoAutomaticoSemanas ? "Modo automático" : "Modo manual"}</strong>
                <Switch checked={config.modoAutomaticoSemanas} onCheckedChange={alternarModo} />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {config.modoAutomaticoSemanas
                  ? "O site mostra sozinho a semana cujas datas incluem hoje."
                  : "Activa manualmente a semana que queres mostrar no site."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <Button asChild>
          <Link to="/gestao/semanas/nova">+ Nova semana</Link>
        </Button>
      </div>

      {weeks.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">Ainda não criaste nenhuma semana.</p>
      ) : (
        <div className="space-y-3">
          {weeks.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <strong className="text-sm">{fmtIntervaloSemana(w.dataInicio, w.dataFim)}</strong>
                  <Badge variant={w.estado === "aberto" ? "sage" : w.estado === "oculto" ? "outline" : "destructive"}>
                    {w.estado === "aberto" ? "🟢 Aberto" : w.estado === "oculto" ? "⚫ Oculto" : "🔴 Fechado"}
                  </Badge>
                  {w.ativaManual && !config.modoAutomaticoSemanas && (
                    <Badge variant="default">activa</Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {fmtPreco(w.precoSemanal, config.moeda)} · {w.vagasRestantes}/{w.vagasTotais} vagas ·{" "}
                  {w._count?.pedidos ?? 0} pedido(s)
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/gestao/semanas/${w.id}`}>Editar</Link>
                  </Button>
                  {!config.modoAutomaticoSemanas && (
                    <Button variant="secondary" size="sm" onClick={() => ativar(w.id)} disabled={w.ativaManual}>
                      {w.ativaManual ? "Activa" : "Tornar activa"}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-[var(--destructive)] hover:text-[var(--destructive)]" onClick={() => setDeleteId(w.id)}>
                    Eliminar ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogHeader>
          <AlertDialogTitle>Tens a certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta semana será removida. Se já tiver pedidos, não poderá ser eliminada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => deleteId && eliminar(deleteId)}>
            Sim, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  );
}
