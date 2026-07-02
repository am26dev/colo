import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { fmtIntervaloSemana } from "../../utils/format";
import type { Order, OrderEstado, OrderTipo } from "../../types";

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<"" | OrderTipo>("");
  const [filtroEstado, setFiltroEstado] = useState<"" | OrderEstado>("");

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
    carregar();
  }

  return (
    <div>
      <h1>Pedidos</h1>
      <p className="sub">Pedidos do menu semanal e pedidos especiais.</p>

      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <label>Tipo</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as "" | OrderTipo)}>
            <option value="">Todos</option>
            <option value="semana">Menu semanal</option>
            <option value="especial">Especial</option>
          </select>
        </div>
        <div>
          <label>Estado</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as "" | OrderEstado)}>
            <option value="">Todos</option>
            <option value="novo">Novo</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {!orders ? (
        <p>A carregar…</p>
      ) : orders.length === 0 ? (
        <p className="muted">Ainda não há pedidos.</p>
      ) : (
        <div className="pedidos-lista">
          {orders.map((o) => (
            <div className="card pedido-item" key={o.id}>
              <div className="pedido-item-head">
                <strong>{o.nome}</strong>
                <span className={`tipo-pill tipo-${o.tipo}`}>{o.tipo === "semana" ? "Menu semanal" : "Especial"}</span>
              </div>
              <p className="muted">
                {o.contacto}
                {o.week ? ` · ${fmtIntervaloSemana(o.week.dataInicio, o.week.dataFim)}` : ""}
              </p>
              {o.ciclo && <p className="muted">Ciclo: {o.ciclo}</p>}
              {o.notas && <p>{o.notas}</p>}
              <p className="muted">{new Date(o.createdAt).toLocaleString("pt-PT")}</p>
              <div className="actions">
                <select value={o.estado} onChange={(e) => mudarEstado(o.id, e.target.value as OrderEstado)}>
                  <option value="novo">Novo</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <button type="button" className="del" onClick={() => apagar(o.id)}>
                  remover ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
