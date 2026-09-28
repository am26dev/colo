import { prisma } from "../db.js";

/**
 * Modelo de reserva.
 *
 * Um pedido entregue pelo site não consome vaga: fica como reserva ("novo")
 * durante um prazo e só a *confirmação* consome a vaga, de forma atómica. Um
 * pedido falso, abandonado ou de encomenda automática deixa de bloquear lugar
 * assim que o prazo passa, sem que o pedido se perca — a dona pode sempre
 * confirmar à mão o que ainda interessar.
 *
 * Duas contagens distintas, e é fácil confundi-las:
 * - `vagasRestantes` = vagas confirmadas. É o número autoritativo e o único
 *   que o compare-and-swap mexe. É o que o painel mostra.
 * - reservas pendentes = lugares prometidos mas ainda não confirmados. Não
 *   toca em `vagasRestantes`; serve para o site parar de vender quando os
 *   lugares confirmados + prometidos esgotam a semana.
 */

/** Prazo de uma reserva, em horas. `RESERVA_TTL_HORAS` no .env ajusta. */
export const PRAZO_RESERVA_HORAS = (() => {
  const bruto = Number(process.env.RESERVA_TTL_HORAS);
  if (!Number.isFinite(bruto) || bruto <= 0) return 48;
  return bruto;
})();

export function prazoReserva(): Date {
  return new Date(Date.now() + PRAZO_RESERVA_HORAS * 60 * 60 * 1000);
}

/** Reservas "novo" que ainda estão dentro do prazo e portanto seguram lugar. */
export function filtroReservasVivas(agora = new Date()) {
  return {
    estado: "novo",
    OR: [{ expiresAt: null }, { expiresAt: { gt: agora } }],
  };
}

export async function contarReservasVivas(weekId: string): Promise<number> {
  return prisma.order.count({ where: { weekId, ...filtroReservasVivas() } });
}

/**
 * Lugares que ainda se podem prometer a alguém: confirmados que sobram menos
 * as reservas vivas. É o número que o site público mostra e a regra que o
 * `POST /api/orders` usa para recusar.
 */
export async function vagasDisponiveis(
  week: { id: string; vagasRestantes: number },
): Promise<number> {
  const pendentes = await contarReservasVivas(week.id);
  return Math.max(0, week.vagasRestantes - pendentes);
}

/**
 * Varredura preguiçosa: marca como "expirado" as reservas cujo prazo passou.
 *
 * Não é necessária para a correcção das contagens (as contagens acima já
 * filtram por prazo), serve para o painel mostrar um estado limpo e distinguir
 * "a cliente desistiu" de "o prazo passou". Correr nas leituras em vez de num
 * timer evita uma tarefa de fundo a gerir dentro de um contentor.
 */
export async function expirarReservas(): Promise<number> {
  const { count } = await prisma.order.updateMany({
    where: { estado: "novo", expiresAt: { lt: new Date() } },
    data: { estado: "expirado" },
  });
  return count;
}

/**
 * Fecha a semana quando a última vaga é consumida.
 *
 * Só age sobre semanas "aberto", e marca `fechadaPorEsgotamento` para que
 * `devolverVaga` saiba depois se pode reabrir. Uma semana que a dona fechou à
 * mão (ou que está "oculto") fica como está — o sistema não volta a abrir
 * vendas por conta própria.
 */
export async function fecharSeEsgotou(weekId: string): Promise<void> {
  await prisma.week.updateMany({
    where: { id: weekId, estado: "aberto", vagasRestantes: { lte: 0 } },
    data: { estado: "fechado", fechadaPorEsgotamento: true },
  });
}

/**
 * Devolve uma vaga à semana e reabre-a se — e só se — o sistema a tinha fechado
 * por esgotamento.
 *
 * Existe em vez de um `update` directo porque quem devolve a vaga não é
 * ocasional: tanto cancelar um pedido como apagá-lo têm de o fazer, e as duas
 * rotas têm de concordar no que acontece à semana. Reabrir só o fecho
 * automático é o que impede que um cancelando desatrase uma semana que a dona
 * fechou de propósito.
 *
 * O caller tem de garantir que só chama isto uma vez por vaga consumida (é o
 * compare-and-swap sobre o estado do pedido que o garante).
 */
export async function devolverVaga(weekId: string): Promise<void> {
  await prisma.week.updateMany({
    where: { id: weekId, vagasRestantes: { gte: 0 } },
    data: { vagasRestantes: { increment: 1 } },
  });
  await prisma.week.updateMany({
    where: {
      id: weekId,
      estado: "fechado",
      fechadaPorEsgotamento: true,
      vagasRestantes: { gt: 0 },
    },
    data: { estado: "aberto", fechadaPorEsgotamento: false },
  });
}
