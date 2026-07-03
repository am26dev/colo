import { prisma } from "../db.js";
import { getActiveWeek } from "./activeWeek.js";

export async function buildSitePayload() {
  const [config, week] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: 1 } }),
    getActiveWeek(),
  ]);

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
    week: week
      ? {
          id: week.id,
          dataInicio: week.dataInicio,
          dataFim: week.dataFim,
          precoSemanal: week.precoSemanal,
          estado: week.estado,
          vagasTotais: week.vagasTotais,
          vagasRestantes: week.vagasRestantes,
          dias: week.dias.map((d) => ({
            diaSemana: d.diaSemana,
            tema: d.tema,
            // icone: d.icone,
            frase: d.frase,
            refeicoes: d.refeicoes as { tipo: string; nome: string; descricao: string; foto: string }[],
          })),
        }
      : null,
  };
}
