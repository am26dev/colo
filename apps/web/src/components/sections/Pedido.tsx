import { EditableText } from "../../edit-mode/EditableText";
import { Reveal } from "../ui/Reveal";
import { PagamentoBox } from "../pedido/PagamentoBox";
import { OrderForm } from "../pedido/OrderForm";
import { PedidoEspecial } from "../pedido/PedidoEspecial";
import { pedidosAbertos } from "../../utils/format";
import type { SiteConfig, Week } from "../../types";

interface PedidoProps {
  week: Week | null;
  config: SiteConfig;
}

export function Pedido({ week, config }: PedidoProps) {
  const aberto = week ? pedidosAbertos(week) : false;

  return (
    <section className="section pedido" id="pedido">
      <span className="blob blob-3" aria-hidden="true"></span>
      <div className="container pedido-inner">
        <Reveal className="pedido-copy">
          <p className="eyebrow"><EditableText contentKey="form.eyebrow" /></p>
          <h2><EditableText contentKey="form.title" /></h2>
          <p><EditableText contentKey="form.subtitle" multiline /></p>
          <PagamentoBox pagamento={config.pagamento} />
        </Reveal>

        <OrderForm week={week} config={config} aberto={aberto} />
      </div>

      <div className="container">
        <PedidoEspecial config={config} />
      </div>
    </section>
  );
}
