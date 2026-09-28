import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/db.js";
import {
  contarReservasVivas,
  expirarReservas,
  filtroReservasVivas,
  prazoReserva,
  vagasDisponiveis,
  PRAZO_RESERVA_HORAS,
} from "../src/lib/reservas.js";
import { limpaDados, migraSeNecessario } from "./helpers.js";

before(async () => {
  migraSeNecessario();
});
beforeEach(limpaDados);
after(async () => {
  await prisma.$disconnect();
});

/** Cria um pedido "semana" na semana dada. */
async function pedido(weekId: string | null, estado: string, expiresAt: Date | null) {
  return prisma.order.create({
    data: { weekId, tipo: weekId ? "semana" : "especial", nome: "Ana", contacto: "9", estado, expiresAt },
  });
}

test("PRAZO_RESERVA_HORAS usa o RESERVA_TTL_HORAS do ambiente", () => {
  // O módulo lê o .env no momento da importação; com RESERVA_TTL_HORAS=48
  // (ver npm test) tem de dar 48, e o default é o mesmo número.
  assert.equal(PRAZO_RESERVA_HORAS, 48);
});

test("prazoReserva devolve um instante no futuro com o prazo configurado", () => {
  const antes = Date.now();
  const p = prazoReserva();
  const horas = (p.getTime() - antes) / 3_600_000;
  assert.ok(horas > 47.9 && horas < 48.1, `esperava ~48h, obtive ${horas}`);
});

test("contarReservasVivas conta só as reservas dentro do prazo", async () => {
  const w = await prisma.week.create({
    data: {
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-12-31"),
      vagasTotais: 10,
      vagasRestantes: 10,
    },
  });

  const dentro = prazoReserva();
  const fora = new Date(Date.now() - 1000); // prazo já passou

  await pedido(w.id, "novo", dentro); // viva
  await pedido(w.id, "novo", fora); // expirada, não conta
  await pedido(w.id, "novo", null); // sem prazo (dados anteriores à migração): conta
  await pedido(w.id, "confirmado", null); // não é reserva
  await pedido(w.id, "cancelado", dentro); // não é reserva
  await pedido(w.id, "expirado", dentro); // não é reserva

  assert.equal(await contarReservasVivas(w.id), 2);
});

test("contarReservasVivas só conta a semana pedida", async () => {
  const a = await prisma.week.create({
    data: { dataInicio: new Date("2026-01-01"), dataFim: new Date("2026-03-01"), vagasTotais: 5, vagasRestantes: 5 },
  });
  const b = await prisma.week.create({
    data: { dataInicio: new Date("2026-04-01"), dataFim: new Date("2026-06-01"), vagasTotais: 5, vagasRestantes: 5 },
  });
  await pedido(a.id, "novo", prazoReserva());
  await pedido(a.id, "novo", prazoReserva());
  await pedido(b.id, "novo", prazoReserva());

  assert.equal(await contarReservasVivas(a.id), 2);
  assert.equal(await contarReservasVivas(b.id), 1);
});

test("filtroReservasVivas monta o filtro esperado", () => {
  const agora = new Date("2026-05-05T00:00:00Z");
  assert.deepEqual(filtroReservasVivas(agora), {
    estado: "novo",
    OR: [{ expiresAt: null }, { expiresAt: { gt: agora } }],
  });
});

test("vagasDisponiveis subtrai as reservas às vagas confirmadas", async () => {
  const w = await prisma.week.create({
    data: { dataInicio: new Date("2026-01-01"), dataFim: new Date("2026-12-31"), vagasTotais: 10, vagasRestantes: 6 },
  });
  await pedido(w.id, "novo", prazoReserva());
  await pedido(w.id, "novo", prazoReserva());

  assert.equal(await vagasDisponiveis(w), 4);
});

test("vagasDisponiveis nunca fica negativa quando as reservas excedem as vagas", async () => {
  // Caso real: reservas criadas quando ainda havia lugares, confirmadas só
  // depois de outras coisas mudarem. O número mostrado nunca pode ser negativo.
  const w = await prisma.week.create({
    data: { dataInicio: new Date("2026-01-01"), dataFim: new Date("2026-12-31"), vagasTotais: 3, vagasRestantes: 1 },
  });
  await pedido(w.id, "novo", prazoReserva());
  await pedido(w.id, "novo", prazoReserva());

  assert.equal(await vagasDisponiveis(w), 0);
});

test("expirarReservas passa a vencido a expirado e devolve a contagem", async () => {
  const w = await prisma.week.create({
    data: { dataInicio: new Date("2026-01-01"), dataFim: new Date("2026-12-31"), vagasTotais: 10, vagasRestantes: 10 },
  });
  const viva = await pedido(w.id, "novo", prazoReserva());
  const vencida1 = await pedido(w.id, "novo", new Date(Date.now() - 60_000));
  const vencida2 = await pedido(w.id, "novo", new Date(Date.now() - 3_600_000));
  const semPrazo = await pedido(w.id, "novo", null);
  const confirmada = await pedido(w.id, "confirmado", null);

  assert.equal(await expirarReservas(), 2);

  const estado = async (id: string) => (await prisma.order.findUniqueOrThrow({ where: { id } })).estado;
  assert.equal(await estado(vencida1.id), "expirado");
  assert.equal(await estado(vencida2.id), "expirado");
  assert.equal(await estado(viva.id), "novo", "reserva dentro do prazo fica intacta");
  assert.equal(await estado(semPrazo.id), "novo", "pedido antigo sem prazo não expira");
  assert.equal(await estado(confirmada.id), "confirmado", "confirmado nunca expira");
});

test("expirarReservas é idempotente", async () => {
  const w = await prisma.week.create({
    data: { dataInicio: new Date("2026-01-01"), dataFim: new Date("2026-12-31"), vagasTotais: 10, vagasRestantes: 10 },
  });
  await pedido(w.id, "novo", new Date(Date.now() - 1000));

  assert.equal(await expirarReservas(), 1);
  assert.equal(await expirarReservas(), 0, "a segunda passagem não encontra nada novo");
});

test("uma reserva vencida deixa de segurar lugar sem precisar da varredura", async () => {
  // O objectivo do mecanismo: um pedido abandonado deixa de bloquear lugar.
  // Isto acontece de forma passiva, nas contagens — o `expiresAt` já é
  // suficiente e não depende de a varredura passar.
  const w = await prisma.week.create({
    data: { dataInicio: new Date("2026-01-01"), dataFim: new Date("2026-12-31"), vagasTotais: 2, vagasRestantes: 2 },
  });
  await pedido(w.id, "novo", prazoReserva());
  await pedido(w.id, "novo", new Date(Date.now() - 1000)); // encomenda automática

  assert.equal(await vagasDisponiveis(w), 1, "a reserva vencida já não conta");

  // A varredura não muda o número, só limpa o estado que o painel mostra.
  assert.equal(await expirarReservas(), 1);
  assert.equal(await vagasDisponiveis(w), 1, "o lugar continua livre");
});
