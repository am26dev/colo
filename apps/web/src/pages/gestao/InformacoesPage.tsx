import { useCallback, useEffect, useState } from "react";
import { InfoCard } from "../../components/gestao/InfoCard";
import { VisibilidadeRodapeCard } from "../../components/gestao/VisibilidadeRodapeCard";
import { api } from "../../lib/api";
import type { SiteConfig } from "../../types";
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "../../components/ui/sonner";
import { PainelHeader } from "../../components/gestao/PainelHeader";
import { Ajuda } from "../../components/gestao/Ajuda";
import { EstadoErro } from "../../components/gestao/EstadoErro";

export default function InformacoesPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(true);

  const carregar = useCallback(async () => {
    setErro("");
    setACarregar(true);
    try {
      const d = await api<{ config: SiteConfig }>("/api/site");
      setConfig(d.config ?? null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar as informações do site.");
    } finally {
      setACarregar(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <>
      <PainelHeader
        titulo="Informações"
        descricao="Os dados que o site usa em todo o lado: por onde te contactam, como se paga e o que aparece no rodapé."
      />

      {erro && <EstadoErro mensagem={erro} aoTentar={carregar} aCarregar={aCarregar} />}

      {config ? (
        <div className="space-y-4">
          <Ajuda
            titulo="Onde é que estes dados aparecem"
            itens={
              <>
                <li><strong>WhatsApp</strong> — é o número de todos os botões e mensagens do site. Se estiver errado, nenhuma reserva chega ao teu WhatsApp.</li>
                <li><strong>Instagram e domínio</strong> — o link e o nome que aparecem no rodapé.</li>
                <li><strong>Moeda</strong> — o símbolo que acompanha todos os preços, no site e no resumo do Dashboard.</li>
                <li><strong>Pagamento</strong> — o bloco de dados de pagamento que aparece no fim do formulário de reserva. Sem linhas, o site escreve “Detalhes de pagamento enviados após o pedido”.</li>
                <li><strong>Mensagem da semana</strong> — a nota no fim da página inicial. Se a apagares, essa nota desaparece do site.</li>
              </>
            }
          />

          <InfoCard
            config={config}
            onSaved={(msg) => toast(msg, "ok")}
            onError={(msg) => toast(msg, "erro")}
          />
          <VisibilidadeRodapeCard
            config={config}
            onSaved={(msg) => toast(msg, "ok")}
            onError={(msg) => toast(msg, "erro")}
          />

          <p className="text-xs text-[var(--muted-foreground)]">
            Para mudar os títulos e frases do site, usa o botão <strong>Editar site</strong> no canto inferior direito. As alterações ficam à espera de <em>Guardar alterações</em> e só entram no site quando o guardas.
          </p>
        </div>
      ) : (
        aCarregar && (
          <div className="space-y-4">
            <Card><CardContent className="p-4"><Skeleton className="h-5 w-48" /><Skeleton className="mt-2 h-4 w-full" /><Skeleton className="mt-2 h-9 w-full" /></CardContent></Card>
            <Card><CardContent className="p-4"><Skeleton className="h-5 w-48" /><Skeleton className="mt-2 h-4 w-3/4" /></CardContent></Card>
          </div>
        )
      )}
    </>
  );
}
