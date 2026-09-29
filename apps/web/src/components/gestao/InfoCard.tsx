import { useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type { PagamentoItem, SiteConfig } from "../../types";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Dica } from "./Ajuda";
import { EstadoErro } from "./EstadoErro";

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
    (config.pagamento ?? []).length ? config.pagamento : [{ etiqueta: "", valor: "" }]
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function updatePag(i: number, patch: Partial<PagamentoItem>) {
    setPagamento((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function removePag(i: number) {
    setPagamento((ps) => ps.filter((_, idx) => idx !== i));
  }
  function addPag() {
    setPagamento((ps) => [...ps, { etiqueta: "", valor: "" }]);
  }

  /** O número do WhatsApp aparece em todo o site: um dígito errado corta a
   *  reserva. O servidor limita-se a remover tudo o que não for dígito, por
   *  isso a validação fica aqui. */
  function validar(): string | null {
    const num = whatsapp.replace(/\D+/g, "");
    if (num && !num.startsWith("244")) {
      return "O WhatsApp tem de começar por 244 (Angola). Exemplo: 244924644918";
    }
    if (num && (num.length < 9 || num.length > 15)) {
      return "O número de WhatsApp não parece completo. Escreve-o só com dígitos, com o 244 à frente.";
    }
    if (instagram.trim() && !/^https?:\/\//i.test(instagram.trim())) {
      return "O link do Instagram tem de começar por https://";
    }
    if (!moeda.trim()) return "A moeda não pode ficar vazia. Usa Kz, por exemplo.";
    const linhasIncompletas = pagamento.findIndex(
      (p) => (p.etiqueta.trim() && !p.valor.trim()) || (!p.etiqueta.trim() && p.valor.trim())
    );
    if (linhasIncompletas >= 0) {
      return `A linha ${linhasIncompletas + 1} de pagamento está pela metade: preenche a etiqueta e o valor, ou apaga a linha.`;
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }
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
      onSaved("Informações do site guardadas. Já estão no site.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Erro ao guardar informações.");
    } finally {
      setSalvando(false);
    }
  }

  const numeroProvisorio = whatsapp.replace(/\D+/g, "");

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="mb-1 text-lg font-semibold" style={{ fontFamily: "Georgia, serif" }}>Informações do site</h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">Contactos, pagamento e a mensagem da semana. É aqui que o site vai buscar os teus dados.</p>

        {erro && <EstadoErro titulo="Revê estes dados antes de guardar" mensagem={erro} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="info-whatsapp">WhatsApp (com 244, só dígitos)</Label>
              <Input id="info-whatsapp" type="text" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="244924644918" />
              <Dica>
                É para este número que vão as reservas e os botões de contacto do site.
                {numeroProvisorio ? (
                  <> O site vai usar <strong>wa.me/{numeroProvisorio}</strong>.</>
                ) : (
                  <> Se ficar vazio, os botões do site não levam a lado nenhum.</>
                )}
              </Dica>
            </div>
            <div className="space-y-2">
              <Label htmlFor="info-instagram">Instagram (link)</Label>
              <Input id="info-instagram" type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
              <Dica>Usado no rodapé. Precisa de começar por https://.</Dica>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="info-dominio">Domínio (rodapé)</Label>
              <Input id="info-dominio" type="text" value={dominio} onChange={(e) => setDominio(e.target.value)} />
              <Dica>O nome que aparece no fim do rodapé, à frente dos direitos.</Dica>
            </div>
            <div className="space-y-2">
              <Label htmlFor="info-moeda">Moeda</Label>
              <Input id="info-moeda" type="text" value={moeda} onChange={(e) => setMoeda(e.target.value)} />
              <Dica>Muda em todo o site: nos preços, no resumo e nas mensagens de WhatsApp.</Dica>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="info-pagamento">Pagamento (Multicaixa Express / IBAN / Titular)</Label>
            <div className="space-y-2">
              {pagamento.map((p, i) => (
                <div className="flex items-start gap-2" key={i}>
                  <Input
                    aria-label={`Etiqueta da linha ${i + 1}`}
                    value={p.etiqueta}
                    onChange={(e) => updatePag(i, { etiqueta: e.target.value })}
                    placeholder="Multicaixa Express"
                  />
                  <Input
                    aria-label={`Valor da linha ${i + 1}`}
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
            <Dica>
              Uma linha por cada via (por exemplo “Multicaixa Express” e o número). Se escreveres o valor com o nome do titular, ele aparece tal e qual.
            </Dica>
          </div>

          <div className="space-y-2">
            <Label htmlFor="info-mensagem">Mensagem da semana (deixa vazio para esconder)</Label>
            <Textarea id="info-mensagem" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Uma mensagem carinhosa..." />
            <Dica>Aparece no fim da página inicial. Se a apagares, a nota desaparece do site.</Dica>
          </div>

          <Button type="submit" disabled={salvando}>
            {salvando ? "A guardar…" : "Guardar informações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
