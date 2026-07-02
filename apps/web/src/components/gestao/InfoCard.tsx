import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type { PagamentoItem, SiteConfig } from "../../types";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

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
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "Georgia, serif" }}>Informações do site</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">Contactos, pagamento e a mensagem da semana.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WhatsApp (com 244, só dígitos)</Label>
              <Input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="244924644918" />
            </div>
            <div className="space-y-2">
              <Label>Instagram (link)</Label>
              <Input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domínio (rodapé)</Label>
              <Input type="text" value={dominio} onChange={(e) => setDominio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Moeda</Label>
              <Input type="text" value={moeda} onChange={(e) => setMoeda(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pagamento (Multicaixa Express / IBAN / Titular)</Label>
            <div className="space-y-2">
              {pagamento.map((p, i) => (
                <div className="flex gap-2 items-start" key={i}>
                  <Input
                    value={p.etiqueta}
                    onChange={(e) => updatePag(i, { etiqueta: e.target.value })}
                    placeholder="Multicaixa Express"
                  />
                  <Input
                    value={p.valor}
                    onChange={(e) => updatePag(i, { valor: e.target.value })}
                    placeholder="923 000 000"
                  />
                  <Button type="button" variant="ghost" size="sm" className="mt-0 shrink-0 text-[var(--destructive)]" onClick={() => removePag(i)}>
                    ✕
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addPag}>
              + Linha de pagamento
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Mensagem da semana (deixa vazio para esconder)</Label>
            <Textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Uma mensagem carinhosa..." />
          </div>

          <Button type="submit" disabled={salvando}>
            Guardar informações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
