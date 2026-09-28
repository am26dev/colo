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

/**
 * Rotas que só a dona pode usar. O teste mais importante de todos: nenhuma
 * delas pode devolver dados de pedidos a quem não tem sessão.
 */
const rotasProtegidas: Array<[string, string, () => RequestInit]> = [
  ["GET", "/api/orders", () => ({})],
  ["PATCH", "/api/orders/qualquer", () => ({ body: JSON.stringify({ estado: "confirmado" }) })],
  ["DELETE", "/api/orders/qualquer", () => ({})],
  ["GET", "/api/dashboard", () => ({})],
  ["GET", "/api/config", () => ({})],
  ["GET", "/api/weeks", () => ({})],
];

test("rotas do painel recusam quem não tem sessão", async () => {
  for (const [metodo, caminho, init] of rotasProtegidas) {
    const r = await api(caminho, { method: metodo, ...init() });
    assert.equal(r.status, 401, `${metodo} ${caminho} devia dar 401 sem token, deu ${r.status}`);
  }
});

test("um token inválido ou de outra assinatura não é aceite", async () => {
  await criaAdmin();
  await login(); // cria a conta para o /setup não passar

  for (const token of ["", "abc", "Bearer nao-e-um-jwt", "a.b.c"]) {
    const r = await api("/api/orders", { method: "GET", token: token || "x" });
    assert.equal(r.status, 401, `token "${token}" devia dar 401`);
  }
});

test("um token sem prefixo Bearer não é aceite", async () => {
  await criaAdmin();
  const token = await login();

  // O header tem de ser "Bearer <token>"; o token sozinho não chega.
  const resp = await api("/api/orders", {
    method: "GET",
    headers: { authorization: token },
  });
  assert.equal(resp.status, 401);
});

test("com sessão válida, o painel responde", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 3, vagasRestantes: 3 });
  await criaPedido();
  await criaAdmin();
  const token = await login();

  const r = await api("/api/orders", { method: "GET", token });
  assert.equal(r.status, 200);
  assert.equal(r.body.orders.length, 1);
  assert.equal(r.body.orders[0].weekId, w.id);
});

test("o login devolve 401 com credenciais erradas e 200 com as certas", async () => {
  await criaAdmin();

  const errado = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "dona@colo.ao", password: "password-errada" }),
  });
  assert.equal(errado.status, 401);

  const certo = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "dona@colo.ao", password: "senha-de-teste-forte" }),
  });
  assert.equal(certo.status, 200);
  assert.ok(certo.body.token, "devolve um token");
});

test("o email do login é insensível a maiúsculas", async () => {
  // A dona escreve o email como quiser; não pode ser preciso ao byte.
  await criaAdmin();
  const r = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "Dona@Colo.AO", password: "senha-de-teste-forte" }),
  });
  assert.equal(r.status, 200);
  assert.ok(r.body.token);
});

test("/setup só funciona sem conta nenhuma", async () => {
  const primeira = await api("/api/auth/setup", {
    method: "POST",
    body: JSON.stringify({ email: "dona@colo.ao", password: "senha-de-teste-forte" }),
  });
  assert.equal(primeira.status, 200);

  const segunda = await api("/api/auth/setup", {
    method: "POST",
    body: JSON.stringify({ email: "outra@colo.ao", password: "senha-de-teste-forte" }),
  });
  assert.equal(segunda.status, 409, "não se pode criar uma segunda conta pela rota pública");
});

test("o payload público do site não inclui dados de pedidos", async () => {
  // /api/site é público por desenho. Não pode vazar nomes nem contactos.
  await criaSemanaActiva({ vagasTotais: 5, vagasRestantes: 5 });
  await criaPedido();

  const r = await api("/api/site");
  assert.equal(r.status, 200);
  const texto = JSON.stringify(r.body);
  assert.ok(!texto.includes("Ana Silva"), "o nome da cliente não pode aparecer no payload público");
  assert.ok(!texto.includes("+244 900 000 000"), "o contacto não pode aparecer no payload público");
});

test("o payload público anuncia as vagas que ainda se podem vender", async () => {
  const w = await criaSemanaActiva({ vagasTotais: 5, vagasRestantes: 5 });
  await criaPedido();

  const r = await api("/api/site");
  assert.equal(r.status, 200);
  const semana = r.body.week;
  assert.equal(semana.vagasRestantes, 5, "as confirmadas não mudaram");
  assert.equal(semana.reservasPendentes, 1, "há uma reserva a segurar lugar");
  assert.equal(semana.vagasDisponiveis, 4, "o site vende 4, não 5");
  void w;
});
