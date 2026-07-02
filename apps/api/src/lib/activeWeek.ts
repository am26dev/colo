import { prisma } from "../db.js";

/** Meia-noite UTC de hoje — mantém a comparação de datas consistente
 *  independentemente do fuso horário da máquina onde a API corre. */
function hojeUTC(): Date {
  const agora = new Date();
  return new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
}

/**
 * Resolve a semana (Week) a mostrar no site público, consoante o modo
 * configurado em SiteConfig.modoAutomaticoSemanas:
 * - automático: a Week cujo intervalo [dataInicio, dataFim] contém hoje
 * - manual: a Week marcada com ativaManual = true
 * Devolve null se nenhuma corresponder (site mostra "menu a ser preparado").
 */
export async function getActiveWeek() {
  const config = await prisma.siteConfig.findUnique({ where: { id: 1 } });
  const automatico = config?.modoAutomaticoSemanas ?? true;

  if (automatico) {
    const hoje = hojeUTC();
    return prisma.week.findFirst({
      where: { dataInicio: { lte: hoje }, dataFim: { gte: hoje } },
      orderBy: { dataInicio: "desc" },
      include: { dias: { orderBy: { diaSemana: "asc" } } },
    });
  }

  return prisma.week.findFirst({
    where: { ativaManual: true },
    include: { dias: { orderBy: { diaSemana: "asc" } } },
  });
}
