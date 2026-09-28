import { prisma } from "../db.js";
import { getActiveWeek } from "./activeWeek.js";
import { contarReservasVivas, expirarReservas } from "./reservas.js";

export async function buildSitePayload() {
  const [config, week] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: 1 } }),
    getActiveWeek(),
  ]);

  // Antes das contagens, para o payload não anunciar lugares presos em reservas
  // já vencidas. Barato: só toca em pedidos "novo" cujo prazo passou.
  await expirarReservas();

  let fallback = false;
  let resolvedWeek = week;

  if (!resolvedWeek) {
    resolvedWeek = await prisma.week.findFirst({
      orderBy: { dataInicio: "desc" },
      include: { dias: { orderBy: { diaSemana: "asc" } } },
    });
    if (resolvedWeek) fallback = true;
  }

  const reservasPendentes = resolvedWeek ? await contarReservasVivas(resolvedWeek.id) : 0;

  return {
    config: config
      ? {
          whatsapp: config.whatsapp,
          instagram: config.instagram,
          dominio: config.dominio,
          moeda: config.moeda,
          mensagemDaSemana: config.mensagemDaSemana,
          pagamento: config.pagamento as { etiqueta: string; valor: string }[],
          modoAutomaticoSemanas: config.modoAutomaticoSemanas,
        }
      : {},
    week: resolvedWeek
      ? {
          id: resolvedWeek.id,
          dataInicio: resolvedWeek.dataInicio,
          dataFim: resolvedWeek.dataFim,
          precoSemanal: resolvedWeek.precoSemanal,
          estado: fallback ? "oculto" : resolvedWeek.estado,
          vagasTotais: resolvedWeek.vagasTotais,
          vagasRestantes: resolvedWeek.vagasRestantes,
          // O que o site público anuncia é o que ainda pode ser prometido
          // (confirmado + reservado), não só o confirmado — de outro modo o
          // banner continuaria a anunciar vagas a quem já as reservou.
          reservasPendentes,
          vagasDisponiveis: Math.max(0, resolvedWeek.vagasRestantes - reservasPendentes),
          dias: resolvedWeek.dias.map((d) => ({
            diaSemana: d.diaSemana,
            tema: d.tema,
            frase: d.frase,
            refeicoes: d.refeicoes as { tipo: string; nome: string; descricao: string; foto: string }[],
          })),
        }
      : null,
  };
}
