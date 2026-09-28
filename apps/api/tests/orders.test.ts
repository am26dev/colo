import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/db.js";
import {
  api,
  arrancaApi,
  fechaApi,
  limpaDados,
  migraSeNecessario,
  criaSemanaActiva,
  criaAdmin,
  login,
  criaPedido,
  vagasDe,
} from "./helpers.js";

before(async () => {
  migraSeNecessario();
  await arrancaApi();
});
beforeEach(limpaDados);
after(async () => {
  await fechaApi();
  await prisma.$disconnect();
});

/** Cria um pedido "semana" directamente na BD (sem passar pela rota). */
async function pedidoDirecto(weekId: string, estado = "novo", expiresAt: Date | null = new Date(Date.now() + 86_400_000)) {
  return prisma.order.create({
    data: { weekId, tipo: "semana", nome: "Ana", contacto: "+244 900 000 000", estado, expiresAt },
  });
}

/**
 * Cria um pedido já confirmado *e* desconta a vaga, para o estado da semana
 * ficar coerente. Escrever só o pedido com estado "confirmado" deixaria a
 * semana com uma vaga a mais e os testes de devolução de vaga passariam a
 * falhar por um motivo que não é o que estão a testar.
 */
async function pedidoConfirmado(weekId: string, token: string) {
  const o = await pedidoDirecto(weekId);
  const r = await PATCH(o.id, "confirmado", token);
  assert.equal(r.status, 200, "não foi possível criar o pedido confirmado de base");
  return o;
}

const PATCH = (id: string, estado: string, token: string) =>
  api(`/api/orders/${id}`, { method: "PATCH", token, body: JSON.stringify({ estado }) });

// ---------------------------------------------------------------- criação ---

test("POST /api/orders cria uma reserva e NÃO consome vaga", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 3, vagasRestantes: 3 });
  const r = await criaPedido();

  assert.equal(r.status, 200);
  assert.equal(r.body.order.estado, "novo");
  assert.ok(r.body.order.expiresAt, "a reserva tem de ter prazo");

  // A diferença essencial do modelo de reservas: a vaga não é consumida aqui.
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 3, estado: "aberto" });
});

test("POST /api/orders recusa quando as vagas confirmadas + reservas acabam", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 1, vagasRestantes: 1 });

  const primeiro = await criaPedido();
  assert.equal(primeiro.status, 200);

  // A reserva segura o único lugar, apesar de vagasRestantes ainda ser 1.
  const segundo = await criaPedido();
  assert.equal(segundo.status, 409);

  // E o lugar é mesmo o do primeiro pedido, não se perdeu nada.
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 1, estado: "aberto" });
});

test("POST /api/orders recusa se a semana não existe ou está fechada", async () => {
  await criaSemanaActiva({ estado: "fechado", vagasTotais: 5, vagasRestantes: 5 });
  const r = await criaPedido();
  assert.equal(r.status, 409);
});

test("POST /api/orders valida o corpo", async () => {
  const semNome = await criaPedido({ nome: "  " });
  assert.equal(semNome.status, 400);

  const especialSemNotas = await criaPedido({ tipo: "especial", notas: "" });
  assert.equal(especialSemNotas.status, 400);
});

test("POST /api/orders para tipo especial não depende de semana nem de vagas", async () => {
  // Sem nenhuma Week na BD: um pedido especial tem de passar na mesma.
  const r = await criaPedido({ tipo: "especial", notas: "sem glúten, sem lactose" });
  assert.equal(r.status, 200);
  assert.equal(r.body.order.weekId, null);
});

// ------------------------------------------------- confirmar (compare-and-swap) ---

test("confirmar consome uma vaga e limpa o prazo da reserva", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 5, vagasRestantes: 5 });
  const o = await pedidoDirecto(w.id);
  await criaAdmin();
  const token = await login();

  const r = await PATCH(o.id, "confirmado", token);
  assert.equal(r.status, 200);
  assert.equal(r.body.order.estado, "confirmado");
  assert.equal(r.body.order.expiresAt, null, "um confirmado não tem prazo de reserva");

  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 4, estado: "aberto" });
});

test("confirmar duas vezes não desconta duas vagas", async () => {
  // O bug que o compare-and-swap existe para evitar. Confirmar um pedido que
  // já está confirmado é um no-op inofensivo (a dona clica duas vezes, ou o
  // painel re-renderiza e reenvia) — o que não pode acontecer é descontar duas
  // vezes. O que interessa é o estado final, não o código de cada resposta.
  const w = await criaSemanaActiva({ vagasTotais: 5, vagasRestantes: 5 });
  const o = await pedidoDirecto(w.id);
  await criaAdmin();
  const token = await login();

  await Promise.all([PATCH(o.id, "confirmado", token), PATCH(o.id, "confirmado", token)]);

  assert.deepEqual(
    await vagasDe(w.id),
    { vagasRestantes: 4, estado: "aberto" },
    "uma única vaga consumida, seja qual for a ordem de chegada",
  );
  assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: o.id } })).estado, "confirmado");
});

test("confirmar quando não há vaga dá 409, mesmo com outro pedido a confirmar", async () => {
  // O caminho de erro: o pedido já estava marcado como confirmado quando se
  // descobre que não havia vaga, por isso tem de ser desfeito. A vaga não pode
  // ficar consumida por um pedido que o painel vai continuar a mostrar como
  // reserva.
  const w = await criaSemanaActiva({ vagasTotais: 2, vagasRestantes: 0 });
  const a = await pedidoDirecto(w.id);
  const b = await pedidoDirecto(w.id);
  await criaAdmin();
  const token = await login();

  const rs = await Promise.all([PATCH(a.id, "confirmado", token), PATCH(b.id, "confirmado", token)]);
  assert.equal(rs.filter((r) => r.status === 409).length, 2, "sem vaga, os dois são recusados");
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 0, estado: "aberto" });
});

test("confirmar sem vagas livres dá 409 e deixa o pedido como reserva", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 2, vagasRestantes: 0 });
  const o = await pedidoDirecto(w.id);
  await criaAdmin();
  const token = await login();

  const r = await PATCH(o.id, "confirmado", token);
  assert.equal(r.status, 409);
  assert.match(r.body.erro, /vagas/i);

  const depois = await prisma.order.findUniqueOrThrow({ where: { id: o.id } });
  assert.equal(depois.estado, "novo", "o pedido volta a reserva, não fica confirmado sem vaga");
  assert.ok(depois.expiresAt, "e mantém o prazo original");
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 0, estado: "aberto" });
});

test("confirmar quando a vaga é a última fecha a semana automaticamente", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 1, vagasRestantes: 1 });
  const o = await pedidoDirecto(w.id);
  await criaAdmin();
  const token = await login();

  assert.equal((await PATCH(o.id, "confirmado", token)).status, 200);
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 0, estado: "fechado" });
});

test("dois pedidos a confirmar em simultâneo com uma vaga só: só um passa", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 5, vagasRestantes: 1 });
  const a = await pedidoDirecto(w.id);
  const b = await pedidoDirecto(w.id);
  await criaAdmin();
  const token = await login();

  const rs = await Promise.all([PATCH(a.id, "confirmado", token), PATCH(b.id, "confirmado", token)]);
  const ok = rs.filter((r) => r.status === 200);
  const conflito = rs.filter((r) => r.status === 409);

  assert.equal(ok.length, 1, "uma vaga, uma confirmação");
  assert.equal(conflito.length, 1);
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 0, estado: "fechado" });

  // O perdedor volta a reserva: a dona ainda pode confirmá-lo mais tarde.
  const perdedor = a.id === ok[0].body.order.id ? b.id : a.id;
  const estado = await prisma.order.findUniqueOrThrow({ where: { id: perdedor } });
  assert.equal(estado.estado, "novo");
});

test("confirmar um pedido especial não toca nas vagas", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 5, vagasRestantes: 5 });
  const o = await prisma.order.create({
    data: { weekId: null, tipo: "especial", nome: "Ana", contacto: "+244 900", notas: "sem glúten" },
  });
  await criaAdmin();
  const token = await login();

  const r = await PATCH(o.id, "confirmado", token);
  assert.equal(r.status, 200);
  assert.equal(r.body.order.estado, "confirmado");
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 5, estado: "aberto" });
});

test("PATCH com estado inválido dá 400", async () => {
  const w = await criaSemanaActiva();
  const o = await pedidoDirecto(w.id);
  await criaAdmin();
  const token = await login();

  assert.equal((await PATCH(o.id, "inventado", token)).status, 400);
  assert.equal((await PATCH(o.id, "confirmado", "token-falso", token)).status, 401);
});

test("PATCH de um pedido inexistente dá 404", async () => {
  await criaAdmin();
  const token = await login();
  assert.equal((await PATCH("nao-existe", "confirmado", token)).status, 404);
});

// ------------------------------------------------- devolver a vaga ---

test("sair de confirmado devolve a vaga à semana", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 3, vagasRestantes: 3 });
  await criaAdmin();
  const token = await login();
  const o = await pedidoConfirmado(w.id, token);
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 2, estado: "aberto" }, "confirmar consumiu uma");

  const r = await PATCH(o.id, "cancelado", token);
  assert.equal(r.status, 200);
  assert.equal(r.body.order.estado, "cancelado");
  assert.equal(r.body.order.expiresAt, null, "cancelado não tem prazo de reserva");
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 3, estado: "aberto" });
});

test("cancelar a última vaga reabre a semana fechada", async () => {
  // Cancelar devolve a vaga; a semana tem de reabrir, senão fica fechada à
  // venda com lugares livres.
  const w = await criaSemanaActiva({ vagasTotais: 1, vagasRestantes: 1 });
  await criaAdmin();
  const token = await login();
  const o = await pedidoConfirmado(w.id, token);
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 0, estado: "fechado" });

  await PATCH(o.id, "cancelado", token);
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 1, estado: "aberto" });
});

test("voltar de confirmado a novo renova o prazo da reserva", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 3, vagasRestantes: 3 });
  await criaAdmin();
  const token = await login();
  const o = await pedidoConfirmado(w.id, token);

  const r = await PATCH(o.id, "novo", token);
  assert.equal(r.status, 200);
  assert.equal(r.body.order.estado, "novo");
  assert.ok(r.body.order.expiresAt, "voltar a novo volta a ser uma reserva com prazo");
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 3, estado: "aberto" });
});

test("dois PATCH a sair do mesmo confirmado devolvem a vaga uma vez só", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 3, vagasRestantes: 3 });
  await criaAdmin();
  const token = await login();
  const o = await pedidoConfirmado(w.id, token);

  await Promise.all([PATCH(o.id, "cancelado", token), PATCH(o.id, "expirado", token)]);

  assert.deepEqual(
    await vagasDe(w.id),
    { vagasRestantes: 3, estado: "aberto" },
    "uma vaga devolvida, não duas",
  );
});

test("transições que não mexem em vagas são livres (novo -> expirado, etc.)", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 4, vagasRestantes: 4 });
  const o = await pedidoDirecto(w.id);
  await criaAdmin();
  const token = await login();

  assert.equal((await PATCH(o.id, "expirado", token)).status, 200);
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 4, estado: "aberto" });
});

// ---------------------------------------------------------------- apagar ---

test("apagar um pedido confirmado devolve a vaga", async () => {
  // Sem isto, apagar do painel fazia desaparecer um lugar sem aviso.
  const w = await criaSemanaActiva({ vagasTotais: 3, vagasRestantes: 3 });
  await criaAdmin();
  const token = await login();
  const o = await pedidoConfirmado(w.id, token);
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 2, estado: "aberto" });

  const r = await api(`/api/orders/${o.id}`, { method: "DELETE", token });
  assert.equal(r.status, 200);
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 3, estado: "aberto" });
  assert.equal(await prisma.order.count({ where: { id: o.id } }), 0);
});

test("apagar uma reserva não mexe nas vagas", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 3, vagasRestantes: 3 });
  const o = await pedidoDirecto(w.id);
  await criaAdmin();
  const token = await login();

  await api(`/api/orders/${o.id}`, { method: "DELETE", token });
  assert.deepEqual(await vagasDe(w.id), { vagasRestantes: 3, estado: "aberto" });
});

test("apagar um pedido inexistente não rebenta", async () => {
  await criaAdmin();
  const token = await login();
  const r = await api("/api/orders/nao-existe", { method: "DELETE", token });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true });
});

// ------------------------------------------ reabrir só no fecho automático ---

test("devolver uma vaga NÃO reabre uma semana que a dona fechou à mão", async () => {
  // O erro que a marca `fechadaPorEsgotamento` evita: tratar todo "fechado"
  // como esgotamento fazia um cancelando reabrir vendas que a dona tinha
  // encerrado de propósito.
  const w = await criaSemanaActiva({ vagasTotais: 5, vagasRestantes: 5 });
  await criaAdmin();
  const token = await login();
  const o = await pedidoConfirmado(w.id, token);

  // Fechar à mão com vagas ainda disponíveis.
  const fechado = await api(`/api/weeks/${w.id}/toggle-estado`, { method: "POST", token });
  assert.equal(fechado.status, 200);
  assert.equal(fechado.body.week.estado, "fechado");
  assert.equal(fechado.body.week.fechadaPorEsgotamento, false, "fecho manual não leva a marca");

  await PATCH(o.id, "cancelado", token);

  const depois = await vagasDe(w.id);
  assert.equal(depois.vagasRestantes, 5, "a vaga volta");
  assert.equal(depois.estado, "fechado", "mas a semana continua fechada, como a dona pediu");
});

test("apagar um pedido também não reabre uma semana fechada à mão", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 5, vagasRestantes: 5 });
  await criaAdmin();
  const token = await login();
  const o = await pedidoConfirmado(w.id, token);

  await api(`/api/weeks/${w.id}/toggle-estado`, { method: "POST", token });
  await api(`/api/orders/${o.id}`, { method: "DELETE", token });

  const depois = await vagasDe(w.id);
  assert.equal(depois.vagasRestantes, 5);
  assert.equal(depois.estado, "fechado");
});

test("a dona a reabrir à mão limpa a marca de fecho automático", async () => {
  // Reaberta à mão, a semana tem de ficar fora da gestão automática, senão o
  // próximo cancelamento a fecharia outra vez sem a dona pedir.
  const w = await criaSemanaActiva({ vagasTotais: 1, vagasRestantes: 1 });
  await criaAdmin();
  const token = await login();
  const o = await pedidoConfirmado(w.id, token);

  let semana = await prisma.week.findUniqueOrThrow({ where: { id: w.id } });
  assert.equal(semana.estado, "fechado");
  assert.equal(semana.fechadaPorEsgotamento, true, "esgotou, logo o sistema fechou");

  await api(`/api/weeks/${w.id}/toggle-estado`, { method: "POST", token });
  await PATCH(o.id, "cancelado", token);

  semana = await prisma.week.findUniqueOrThrow({ where: { id: w.id } });
  assert.equal(semana.estado, "aberto", "a dona tinha reaberto, o cancelamento não fecha nada");
  assert.equal(semana.vagasRestantes, 1);
});

test("guardar a semana pela mão também limpa a marca", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 1, vagasRestantes: 1 });
  await criaAdmin();
  const token = await login();
  await pedidoConfirmado(w.id, token);
  assert.equal(
    (await prisma.week.findUniqueOrThrow({ where: { id: w.id } })).fechadaPorEsgotamento,
    true,
  );

  const guardado = await api(`/api/weeks/${w.id}`, {
    method: "PUT",
    token,
    body: JSON.stringify({
      dataInicio: w.dataInicio,
      dataFim: w.dataFim,
      estado: "aberto",
      vagasTotais: 1,
      vagasRestantes: 0,
      dias: [1, 2, 3, 4, 5].map((d) => ({ diaSemana: d, refeicoes: [] })),
    }),
  });
  assert.equal(guardado.status, 200);
  assert.equal(guardado.body.week.fechadaPorEsgotamento, false);
});
