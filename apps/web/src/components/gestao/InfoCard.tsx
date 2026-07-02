import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type { PagamentoItem, SiteConfig } from "../../types";

interface Props {
  config: SiteConfig;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
}

export function InfoCard({ config, onSaved, onError }: Props) {
  const [whatsapp, setWhatsapp] = useState(config.whatsapp);
  const [instagram, setInstagram] = useState(config.instagram);
  const [dominio, setDominio] = useState(config.dominio);
  const [moeda, setMoeda] = useState(config.moeda);
  const [mensagem, setMensagem] = useState(config.mensagemDaSemana);
  const [pagamento, setPagamento] = useState<PagamentoItem[]>(
    config.pagamento.length ? config.pagamento : [{ etiqueta: "", valor: "" }]
  );
  const [salvando, setSalvando] = useState(false);

  function updatePag(i: number, patch: Partial<PagamentoItem>) {
    setPagamento((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function removePag(i: number) {
    setPagamento((ps) => ps.filter((_, idx) => idx !== i));
  }
  function addPag() {
    setPagamento((ps) => [...ps, { etiqueta: "", valor: "" }]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api("/api/config", {
        method: "PUT",
        body: JSON.stringify({
          whatsapp,
          instagram,
          dominio,
          moeda,
          mensagemDaSemana: mensagem,
          pagamento: pagamento.filter((p) => p.etiqueta.trim() || p.valor.trim()),
          // não editável aqui (ver página Semanas) — reenviado tal como veio para não ser reposto ao default
          modoAutomaticoSemanas: config.modoAutomaticoSemanas ?? true,
        }),
      });
      onSaved("Informações do site guardadas. ✓");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao guardar informações.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="card">
      <h2>Informações do site</h2>
      <p className="sub">Contactos, pagamento e a mensagem da semana.</p>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div>
            <label>WhatsApp (com 244, só dígitos)</label>
            <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="244924644918" />
          </div>
          <div>
            <label>Instagram (link)</label>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Domínio (rodapé)</label>
            <input type="text" value={dominio} onChange={(e) => setDominio(e.target.value)} />
          </div>
          <div>
            <label>Moeda</label>
            <input type="text" value={moeda} onChange={(e) => setMoeda(e.target.value)} />
          </div>
        </div>

        <label>Pagamento (Multicaixa Express / IBAN / Titular)</label>
        <div>
          {pagamento.map((p, i) => (
            <div className="pag-row" key={i}>
              <input
                type="text"
                value={p.etiqueta}
                onChange={(e) => updatePag(i, { etiqueta: e.target.value })}
                placeholder="Multicaixa Express"
              />
              <input
                type="text"
                value={p.valor}
                onChange={(e) => updatePag(i, { valor: e.target.value })}
                placeholder="923 000 000"
              />
              <button type="button" className="del" onClick={() => removePag(i)}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn ghost sm" onClick={addPag}>
          + Linha de pagamento
        </button>

        <label style={{ marginTop: 16 }}>Mensagem da semana (deixa vazio para esconder)</label>
        <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Uma mensagem carinhosa..." />

        <div className="actions">
          <button className="btn" type="submit" disabled={salvando}>
            Guardar informações
          </button>
        </div>
      </form>
    </div>
  );
}
