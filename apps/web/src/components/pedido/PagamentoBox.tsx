import type { PagamentoItem } from "../../types";

export function PagamentoBox({ pagamento }: { pagamento: PagamentoItem[] }) {
  return (
    <div className="pay-box">
      <h3>Pagamento</h3>
      <ul>
        {pagamento.length ? (
          pagamento.map((item) => (
            <li key={item.etiqueta}>
              <strong>{item.etiqueta}:</strong> {item.valor}
            </li>
          ))
        ) : (
          <li>Detalhes de pagamento enviados após o pedido.</li>
        )}
      </ul>
    </div>
  );
}
