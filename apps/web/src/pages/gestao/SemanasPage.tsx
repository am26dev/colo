import { useCallback, useEffect, useState } from "react";
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
import { PainelHeader } from "../../components/gestao/PainelHeader";
import { Ajuda, Dica } from "../../components/gestao/Ajuda";
import { EstadoErro } from "../../components/gestao/EstadoErro";

export default function SemanasPage() {
  const [weeks, setWeeks] = useState<WeekListItem[] | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [aSalvarModo, setASalvarModo] = useState(false);

  const carregar = useCallback(async () => {
    setErro("");
    try {
      const [d, c] = await Promise.all([
        api<{ weeks: WeekListItem[] }>("/api/weeks"),
        api<{ config: SiteConfig }>("/api/site"),
      ]);
      setWeeks(d.weeks ?? []);
      setConfig(c.config ?? null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível falar com o servidor.");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function alternarModo() {
    if (!config) return;
    const novoConfig = { ...config, modoAutomaticoSemanas: !config.modoAutomaticoSemanas };
    setASalvarModo(true);
    try {
      await api("/api/config", { method: "PUT", body: JSON.stringify(novoConfig) });
      setConfig(novoConfig);
      toast(`Modo ${novoConfig.modoAutomaticoSemanas ? "automático" : "manual"} activado.`, "ok");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível mudar o modo.", "erro");
    } finally {
      setASalvarModo(false);
    }
  }

  async function ativar(id: string) {
    try {
      await api(`/api/weeks/${id}/ativar`, { method: "POST" });
      toast("Semana activada. É esta que o site mostra a partir de agora.", "ok");
      await carregar();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível activar a semana.", "erro");
    }
  }

  async function eliminar(id: string) {
    try {
      await api(`/api/weeks/${id}`, { method: "DELETE" });
      setDeleteId(null);
      toast("Semana eliminada.", "ok");
      await carregar();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao eliminar.", "erro");
      setDeleteId(null);
    }
  }

  if (!weeks || !config) {
    return (
      <>
        <PainelHeader titulo="Semanas" descricao="A carregar as semanas..." />
        {erro && <EstadoErro mensagem={erro} aoTentar={carregar} />}
        <div className="space-y-4">
          <Card><CardContent className="space-y-3 p-4"><Skeleton className="h-6 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}><CardContent className="space-y-2 p-4"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /></CardContent></Card>
          ))}
        </div>
      </>
    );
  }

  const aEliminar = deleteId ? weeks.find((w) => w.id === deleteId) : null;

  return (
    <>
      <PainelHeader
        titulo="Semanas"
        descricao="Cria e gere os menus semanais. Só uma semana está activa de cada vez: é essa que o site mostra e que aceita pedidos."
      >
        <Button asChild size="sm">
          <Link to="/gestao/semanas/nova">+ Nova semana</Link>
        </Button>
      </PainelHeader>

      <Ajuda
        titulo="Como o site decide que semana mostra"
        itens={
          <>
            <li><strong>Modo automático</strong> — o site escolhe sozinho a semana cujas datas incluem hoje. Se nenhuma incluir hoje, o site passa a mostrar a semana mais recente como encerrada: o menu fica visível, mas aparece “Pedidos encerrados” e o formulário só serve para pedir aviso.</li>
            <li><strong>Modo manual</strong> — mandas tu: a semana com o botão <em>Tornar activa</em> é a que o site mostra, independentemente das datas. Útil para preparar a semana seguinte antes de ela começar.</li>
            <li><strong>Aberto</strong> — aceita pedidos. <strong>Fechado</strong> — o menu continua visível mas já não aceita pedidos. <strong>Oculto</strong> — a semana desaparece do site.</li>
            <li><strong>Eliminar ✕</strong> — só é possível em semanas sem pedidos. Se já houver reservas, o servidor recusa e o pedido fica intacto.</li>
            <li>As vagas nunca se mexem sozinhas: sobem quando um pedido é confirmado e descem quando é cancelado ou apagado. Quando chega a zero, a semana fecha sozinha.</li>
          </>
        }
      />

      {erro && <EstadoErro mensagem={erro} aoTentar={carregar} />}

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <strong className="text-sm">{config.modoAutomaticoSemanas ? "Modo automático" : "Modo manual"}</strong>
                <Switch checked={config.modoAutomaticoSemanas} onCheckedChange={alternarModo} disabled={aSalvarModo} />
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {config.modoAutomaticoSemanas
                  ? "O site mostra sozinho a semana cujas datas incluem hoje."
                  : "Activa manualmente a semana que queres mostrar no site."}
              </p>
              <Dica>
                {config.modoAutomaticoSemanas
                  ? "Ao mudar para manual, escolhe com “Tornar activa” a semana que o site passa a mostrar."
                  : "Em modo manual o botão “Tornar activa” desliga todas as outras semanas."}
              </Dica>
            </div>
          </div>
        </CardContent>
      </Card>

      {weeks.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Ainda não criaste nenhuma semana. Cria a primeira com <strong>+ Nova semana</strong> — sem uma semana activa o site mostra a última que existir como encerrada, e ninguém consegue reservar.
        </p>
      ) : (
        <div className="space-y-3">
          {weeks.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2">
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
                {w.estado === "oculto" && <Dica>Esta semana não aparece no site enquanto estiver oculta.</Dica>}
                {w.estado === "fechado" && <Dica>Continua visível, mas o site recusa novos pedidos para estas datas.</Dica>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
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
            {aEliminar ? (
              <>
                A semana de <strong>{fmtIntervaloSemana(aEliminar.dataInicio, aEliminar.dataFim)}</strong> será removida,{" "}
                {aEliminar._count?.pedidos
                  ? "mas já tem pedidos associados — o servidor vai recusar e nada se perde."
                  : "não há pedidos associados, portanto nada se perde. Se só queres parar de vender, fecha-a em vez de eliminar."}
              </>
            ) : (
              "Esta semana será removida. Se já tiver pedidos, não poderá ser eliminada."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => deleteId && eliminar(deleteId)}>
            Sim, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </>
  );
}
