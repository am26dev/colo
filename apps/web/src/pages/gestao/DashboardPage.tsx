import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { fmtIntervaloSemana } from "../../utils/format";
import type { DashboardSummary } from "../../types";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { PainelHeader } from "../../components/gestao/PainelHeader";
import { Ajuda } from "../../components/gestao/Ajuda";
import { EstadoErro } from "../../components/gestao/EstadoErro";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aCarregar, setACarregar] = useState(true);

  const carregar = useCallback(async () => {
    setErro(null);
    setACarregar(true);
    try {
      setSummary(await api<DashboardSummary>("/api/dashboard/summary"));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível falar com o servidor.");
    } finally {
      setACarregar(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const semana = summary?.semanaAtiva ?? null;

  return (
    <>
      <PainelHeader
        titulo="Dashboard"
        descricao="O estado do negócio num só ecrã: a semana que está a vender e os pedidos que precisam de resposta."
      >
        <Button asChild variant="outline" size="sm">
          <Link to="/gestao/pedidos">Ver pedidos</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/gestao/semanas">Gerir semanas</Link>
        </Button>
      </PainelHeader>

      {erro ? (
        <EstadoErro mensagem={`${erro} Nenhum dado foi alterado.`} aoTentar={carregar} aCarregar={aCarregar} />
      ) : aCarregar || !summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <Ajuda
            titulo="Como ler estes números"
            itens={
              <>
                <li><strong>Semana ativa</strong> — é a semana que o site está a mostrar. Para mudar, vai a <em>Semanas</em>.</li>
                <li><strong>Aberto / Fechado / Oculto</strong> — <em>Aberto</em> aceita reservas; <em>Fechado</em> mantém o menu visível mas bloqueia novas reservas; <em>Oculto</em> tira a semana do site.</li>
                <li><strong>Vagas restantes</strong> — lugares por vender nesta semana (restantes / total). Cada pedido confirmado ocupa uma vaga.</li>
                <li><strong>Pedidos desta semana</strong> — quantos pedidos (confirmados, cancelados ou por responder) existem para a semana ativa.</li>
                <li><strong>Pedidos por confirmar</strong> — chegaram e ainda não decidiste. Só depois de <em>Confirmar</em> é que a cliente recebe confirmação e ocupa vaga.</li>
              </>
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col gap-2 p-4">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Semana ativa</span>
                <span className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>
                  {semana ? fmtIntervaloSemana(semana.dataInicio, semana.dataFim) : "Nenhuma"}
                </span>
                {semana && (
                  <Badge variant={semana.estado === "aberto" ? "sage" : "destructive"} className="self-start">
                    {semana.estado === "aberto" ? "🟢 Aberto" : semana.estado === "oculto" ? "⚫ Oculto" : "🔴 Fechado"}
                  </Badge>
                )}
                {!semana && (
                  <p className="text-xs text-[var(--muted-foreground)]">Ativa uma semana em Semanas para o site voltar a vender.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-2 p-4">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Vagas restantes</span>
                <span className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>
                  {semana ? `${semana.vagasRestantes} / ${semana.vagasTotais}` : "—"}
                </span>
                {semana && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {semana.vagasRestantes === 0
                      ? "Sem lugares: o site já não aceita reservas para esta semana."
                      : `Faltam ${semana.vagasTotais - semana.vagasRestantes} de ${semana.vagasTotais} lugares vendidos.`}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-2 p-4">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Pedidos desta semana</span>
                <span className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>
                  {summary.pedidosSemanaAtiva}
                </span>
                <p className="text-xs text-[var(--muted-foreground)]">Inclui os que ainda estão por responder.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-2 p-4">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Pedidos por confirmar</span>
                <span className="text-xl font-semibold" style={{ fontFamily: "Georgia, serif" }}>
                  {summary.pedidosNovos}
                </span>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {summary.pedidosNovos > 0 ? "Responde-lhes hoje em Pedidos." : "Não há nada à tua espera."}
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="mt-6 text-xs text-[var(--muted-foreground)]">
            Este ecrã é só de leitura: não alteras nada aqui. Para mudar o site, usa Semanas, Informações ou o botão <em>Editar site</em>.
          </p>
        </>
      )}
    </>
  );
}
