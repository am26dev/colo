import { useState, type FormEvent } from "react";
import { pedidoEspecialSecao } from "../../data/data";
import { api } from "../../lib/api";
import { montarMensagemPedidoEspecial, whatsappLink } from "../../utils/whatsapp";
import type { Order, SiteConfig } from "../../types";

export function PedidoEspecial({ config }: { config: SiteConfig }) {
  const [nome, setNome] = useState("");
  const [contacto, setContacto] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim() || !contacto.trim() || !notas.trim()) {
      setErro("Preenche o nome, contacto e o que precisas.");
      return;
    }
    setEnviando(true);
    try {
      await api<{ order: Order }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ tipo: "especial", nome, contacto, notas }),
      });
      window.open(whatsappLink(config.whatsapp, montarMensagemPedidoEspecial(nome, contacto, notas)), "_blank");
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível enviar. Tenta novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="pedido-especial pedido-especial-enviado">
        <p>Recebemos o teu pedido especial. Vamos responder-te pelo WhatsApp em breve. 💛</p>
        <button type="button" className="btn btn-ghost sm" onClick={() => { setEnviado(false); setNome(""); setContacto(""); setNotas(""); }}>
          Fazer outro pedido
        </button>
      </div>
    );
  }

  return (
    <form className="pedido-especial" onSubmit={handleSubmit} noValidate>
      <p className="eyebrow">{pedidoEspecialSecao.eyebrow}</p>
      <h3>{pedidoEspecialSecao.titulo}</h3>
      <p className="pedido-especial-texto">{pedidoEspecialSecao.texto}</p>

      {erro && <div className="form-closed">{erro}</div>}

      <div className="field">
        <label htmlFor="especial-nome">O teu nome</label>
        <input id="especial-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="especial-contacto">WhatsApp / Telemóvel</label>
        <input id="especial-contacto" type="tel" value={contacto} onChange={(e) => setContacto(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="especial-notas">O que precisas?</label>
        <textarea
          id="especial-notas"
          rows={3}
          placeholder={pedidoEspecialSecao.placeholderNotas}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-ghost btn-block" disabled={enviando}>
        {enviando ? "A enviar…" : pedidoEspecialSecao.submitLabel}
      </button>
    </form>
  );
}
