import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { fmtIntervaloSemana } from "../../utils/format";
import type { Order, OrderEstado, OrderTipo } from "../../types";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Skeleton } from "../../components/ui/skeleton";
import { PainelHeader } from "../../components/gestao/PainelHeader";
import { Ajuda, Dica } from "../../components/gestao/Ajuda";
import { EstadoErro } from "../../components/gestao/EstadoErro";

/** O que vai acontecer ao pedido quando muda de estado. */
function consequencia(de: OrderEstado, para: OrderEstado): string {
  if (para === "confirmado") {
    return "Vai ocupar uma vaga da semana. A reserva perde o prazo: a cliente tem de ser avisada por ti, pelo contacto indicado no pedido.";
  }
  if (de === "confirmado") {
    return "Vai libertar a vaga da semana. A semana volta a abrir sozinha só se tiver fechado por esgotamento.";
  }
  if (para === "novo") {
    return "Volta a ficar como reserva, com 48 horas de prazo. Não ocupa vaga enquanto não for confirmado.";
  }
  if (para === "cancelado") {
    return "Fica marcado como cancelado e o lugar volta a estar livre para outra cliente.";
  }
  return "Fica marcado como expirado. É o estado que o sistema usa quando o prazo da reserva passa; serve para limpar a lista.";
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<"" | OrderTipo>("");
  const [filtroEstado, setFiltroEstado] = useState<"" | OrderEstado>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [erroCarga, setErroCarga] = useState("");
  const [aCarregar, setACarregar] = useState(true);

  const carregar = useCallback(async () => {
    setErroCarga("");
    setACarregar(true);
    const params = new URLSearchParams();
    if (filtroTipo) params.set("tipo", filtroTipo);
    if (filtroEstado) params.set("estado", filtroEstado);
    const qs = params.toString();
    try {
      const d = await api<{ orders: Order[] }>(`/api/orders${qs ? `?${qs}` : ""}`);
      setOrders(d.orders ?? []);
    } catch (e) {
      setErroCarga(e instanceof Error ? e.message : "Não foi possível falar com o servidor.");
    } finally {
      setACarregar(false);
    }
  }, [filtroTipo, filtroEstado]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // Confirmar consome uma vaga e o servidor recusa com 409 se já não houver
  // nenhuma — o erro tem de chegar ao ecrã, senão a select fica desactualizada
  // e a dona repete o clique sem perceber. O `finally` recarrega sempre a lista
  // para a select voltar ao estado real, confirmado ou não.
  async function mudarEstado(id: string, estado: OrderEstado) {
    setErro("");
    try {
      await api(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ estado }) });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível mudar o estado do pedido.");
    } finally {
      await carregar();
    }
  }

  async function apagar(id: string) {
    setErro("");
    try {
      await api(`/api/orders/${id}`, { method: "DELETE" });
      setDeleteId(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível remover o pedido.");
    } finally {
      await carregar();
    }
  }

  const aRemover = deleteId ? orders?.find((o) => o.id === deleteId) : null;
  const pendentes = orders?.filter((o) => o.estado === "novo").length ?? 0;

  return (
    <>
      <PainelHeader
        titulo="Pedidos"
        descricao="Tudo o que chegou pelo site: reservas do menu semanal e pedidos especiais. É aqui que decides o que fica garantido."
      >
        {orders && (
          <span className="text-xs text-[var(--muted-foreground)]">
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
            {pendentes > 0 ? ` · ${pendentes} por responder` : ""}
          </span>
        )}
      </PainelHeader>

      <Ajuda
        titulo="O que cada estado faz"
        itens={
          <>
            <li><strong>Novo</strong> — a reserva está a aguardar a tua resposta. Ainda <em>não</em> ocupa vaga e tem 48 horas de prazo; findo esse prazo passa sozinha a <em>Expirado</em> e o lugar fica livre.</li>
            <li><strong>Confirmado</strong> — é o único estado que ocupa vaga. Ao confirmares, deves avisar a cliente pelo contacto indicado.</li>
            <li><strong>Cancelado</strong> — desistência ou recusa tua. Se o pedido estava confirmado, a vaga volta automaticamente à semana.</li>
            <li><strong>Expirado</strong> — o prazo passou sem resposta. Serve para manter a lista limpa.</li>
            <li><strong>Remover ✕</strong> — apaga o pedido para sempre. Se estava confirmado, a vaga também volta. Para manter o histórico, prefere <em>Cancelado</em>.</li>
            <li>Quando a última vaga é ocupada, a semana <strong>fecha sozinha</strong> e o site deixa de aceitar reservas.</li>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="space-y-1">
          <Label htmlFor="filtro-tipo" className="text-xs text-[var(--foreground)]">Tipo</Label>
          <Select id="filtro-tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as "" | OrderTipo)}>
            <option value="">Todos</option>
            <option value="semana">Menu semanal</option>
            <option value="especial">Especial</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="filtro-estado" className="text-xs text-[var(--foreground)]">Estado</Label>
          <Select id="filtro-estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as "" | OrderEstado)}>
            <option value="">Todos</option>
            <option value="novo">Novo (reserva)</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="expirado">Expirado</option>
          </Select>
        </div>
        {pendentes > 0 && (
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => { setFiltroEstado("novo"); setFiltroTipo(""); }}>
              Ver só os {pendentes} por responder
            </Button>
          </div>
        )}
      </div>

      {erro && <EstadoErro titulo="Não foi possível aplicar a alteração" mensagem={erro} />}
      {erroCarga && <EstadoErro mensagem={erroCarga} aoTentar={carregar} aCarregar={aCarregar} />}

      {orders === null || (aCarregar && erroCarga === "") ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="space-y-2 p-4"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          {filtroTipo || filtroEstado ? "Nenhum pedido corresponde a estes filtros." : "Ainda não há pedidos."}
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-4">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{o.nome}</strong>
                  <Badge variant={o.tipo === "semana" ? "sage" : "rose"}>
                    {o.tipo === "semana" ? "Menu semanal" : "Especial"}
                  </Badge>
                  <Badge variant={o.estado === "confirmado" ? "sage" : o.estado === "novo" ? "outline" : "secondary"}>
                    {o.estado}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {o.contacto}
                  {o.week ? ` · ${fmtIntervaloSemana(o.week.dataInicio, o.week.dataFim)}` : ""}
                </p>
                {o.ciclo && <p className="mt-1 text-xs text-[var(--muted-foreground)]">Personalização: {o.ciclo}</p>}
                {o.notas && <p className="mt-2 text-sm">{o.notas}</p>}
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{new Date(o.createdAt).toLocaleString("pt-PT")}</p>
                {o.estado === "novo" && o.expiresAt && (
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Reserva até {new Date(o.expiresAt).toLocaleString("pt-PT")} — depois disso liberta o lugar.
                  </p>
                )}
                {o.estado === "confirmado" && o.tipo === "semana" && (
                  <Dica>Esta reserva já ocupa uma vaga. Para libertares o lugar, muda o estado.</Dica>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`estado-${o.id}`} className="text-xs text-[var(--muted-foreground)]">Mudar estado</Label>
                    <Select
                      id={`estado-${o.id}`}
                      value={o.estado}
                      onChange={(e) => mudarEstado(o.id, e.target.value as OrderEstado)}
                      className="w-auto"
                    >
                      <option value="novo">Novo</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="cancelado">Cancelado</option>
                      <option value="expirado">Expirado</option>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[var(--destructive)] hover:text-[var(--destructive)]" onClick={() => setDeleteId(o.id)}>
                    Remover ✕
                  </Button>
                </div>
                <Dica>
                  {o.estado === "confirmado"
                    ? `Se mudares para Cancelado: ${consequencia(o.estado, "cancelado")}`
                    : `Se mudares para Confirmado: ${consequencia(o.estado, "confirmado")}`}
                </Dica>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogHeader>
          <AlertDialogTitle>Tens a certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            {aRemover ? (
              <>
                O pedido de <strong>{aRemover.nome}</strong> será removido definitivamente e não há como voltar atrás.
                {aRemover.estado === "confirmado" && aRemover.tipo === "semana" && " A vaga vai voltar para a semana."}
                {aRemover.estado === "confirmado" && aRemover.tipo === "especial" && " Este pedido especial não ocupava vaga."}
                {" Se só querias registar uma desistência, usa antes o estado "}
                <strong>Cancelado</strong>.
              </>
            ) : (
              "Este pedido será removido definitivamente. Não há como voltar atrás."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => deleteId && apagar(deleteId)}>
            Sim, remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </>
  );
}
