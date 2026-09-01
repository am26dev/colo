import { prisma } from "../db.js";
import { getActiveWeek } from "./activeWeek.js";

export async function buildSitePayload() {
  const [config, week] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: 1 } }),
    getActiveWeek(),
  ]);

  let fallback = false;
  let resolvedWeek = week;

  if (!resolvedWeek) {
    resolvedWeek = await prisma.week.findFirst({
      orderBy: { dataInicio: "desc" },
      include: { dias: { orderBy: { diaSemana: "asc" } } },
    });
    if (resolvedWeek) fallback = true;
  }

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
