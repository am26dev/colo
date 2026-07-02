import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { fmtIntervaloSemana } from "../../utils/format";
import type { Order, OrderEstado, OrderTipo } from "../../types";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Skeleton } from "../../components/ui/skeleton";

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<"" | OrderTipo>("");
  const [filtroEstado, setFiltroEstado] = useState<"" | OrderEstado>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function carregar() {
    const params = new URLSearchParams();
    if (filtroTipo) params.set("tipo", filtroTipo);
    if (filtroEstado) params.set("estado", filtroEstado);
    const qs = params.toString();
    api<{ orders: Order[] }>(`/api/orders${qs ? `?${qs}` : ""}`).then((d) => setOrders(d.orders));
  }

  useEffect(carregar, [filtroTipo, filtroEstado]);

  async function mudarEstado(id: string, estado: OrderEstado) {
    await api(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ estado }) });
    carregar();
  }

  async function apagar(id: string) {
    await api(`/api/orders/${id}`, { method: "DELETE" });
    setDeleteId(null);
    carregar();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "Georgia, serif" }}>Pedidos</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">Pedidos do menu semanal e pedidos especiais.</p>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--foreground)]">Tipo</label>
          <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as "" | OrderTipo)}>
            <option value="">Todos</option>
            <option value="semana">Menu semanal</option>
            <option value="especial">Especial</option>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--foreground)]">Estado</label>
          <Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as "" | OrderEstado)}>
            <option value="">Todos</option>
            <option value="novo">Novo</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </div>
      </div>

      {orders === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">Ainda não há pedidos.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <strong className="text-sm">{o.nome}</strong>
                  <Badge variant={o.tipo === "semana" ? "sage" : "rose"}>
                    {o.tipo === "semana" ? "Menu semanal" : "Especial"}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {o.contacto}
                  {o.week ? ` · ${fmtIntervaloSemana(o.week.dataInicio, o.week.dataFim)}` : ""}
                </p>
                {o.ciclo && <p className="text-xs text-[var(--muted-foreground)] mt-1">Ciclo: {o.ciclo}</p>}
                {o.notas && <p className="text-sm mt-2">{o.notas}</p>}
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{new Date(o.createdAt).toLocaleString("pt-PT")}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Select
                    value={o.estado}
                    onChange={(e) => mudarEstado(o.id, e.target.value as OrderEstado)}
                    className="w-auto"
                  >
                    <option value="novo">Novo</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </Select>
                  <Button variant="ghost" size="sm" className="text-[var(--destructive)] hover:text-[var(--destructive)]" onClick={() => setDeleteId(o.id)}>
                    Remover ✕
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
            Este pedido será removido definitivamente. Não há como voltar atrás.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => deleteId && apagar(deleteId)}>
            Sim, remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  );
}
