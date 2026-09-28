import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/db.js";
import { api, arrancaApi, fechaApi, migraSeNecessario, pedidoValido } from "./helpers.js";

before(async () => {
  migraSeNecessario();
  await arrancaApi();
});
after(async () => {
  await fechaApi();
  await prisma.$disconnect();
});

/**
 * POST /api/orders está atrás de `pedidosLimite`: 8 pedidos por hora e por IP.
 * O IP chega em X-Forwarded-For (o Caddy reescreve; a app declara `trust proxy`),
 * por isso cada teste usa um IP sintético próprio para não partilhar balde.
 */
let ipCounter = 0;
function ipNovo() {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

function pedir(ip: string) {
  return api("/api/orders", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
    body: JSON.stringify(pedidoValido),
  });
}

test("deixa passar até 8 pedidos por hora no mesmo IP", async () => {
  const ip = ipNovo();
  for (let i = 0; i < 8; i++) {
    const r = await pedir(ip);
    // Sem semana activa a rota recusa com 409 — o que interessa é que NÃO é 429:
    // o limite não disparou antes da 9.ª tentativa.
    assert.notEqual(r.status, 429, `tentativa ${i + 1} não devia estar bloqueada`);
  }
});

test("a 9.ª tentativa no mesmo IP leva 429 com Retry-After", async () => {
  const ip = ipNovo();
  for (let i = 0; i < 8; i++) await pedir(ip);

  const r = await pedir(ip);
  assert.equal(r.status, 429);
  assert.match(r.body.erro, /Demasiados pedidos/i);
  assert.ok(r.headers.get("retry-after"), "a resposta tem de dizer quando tentar outra vez");
  assert.ok(Number(r.headers.get("retry-after")) > 0);
});

test("devolve os cabeçalhos RateLimit-* em cada resposta", async () => {
  const ip = ipNovo();
  const primeiro = await pedir(ip);
  assert.equal(primeiro.headers.get("ratelimit-limit"), "8");
  assert.equal(primeiro.headers.get("ratelimit-remaining"), "7");
  assert.ok(Number(primeiro.headers.get("ratelimit-reset")) > 0);

  const segundo = await pedir(ip);
  assert.equal(segundo.headers.get("ratelimit-remaining"), "6");
});

test("o balde é por IP: outro IP não é afectado", async () => {
  // A razão de existir do `trust proxy`: sem ele, todos os clientes da VPS
  // contariam como um só e um atacante bloquearia o site inteiro.
  const ipA = ipNovo();
  const ipB = ipNovo();

  for (let i = 0; i < 8; i++) await pedir(ipA);
  assert.equal((await pedir(ipA)).status, 429);

  assert.notEqual((await pedir(ipB)).status, 429, "outro IP tem o seu próprio balde");
});

test("um X-Forwarded-For falsificado não contorna o limite", async () => {
  // `trust proxy` = 1: conta-se o último salto antes do Caddy, ou seja o
  // cabeçalho que o próprio Caddy escreve, e não a cadeia whole que o
  // cliente mandou. Mandar X-Forwarded-For com IPs vários não abre uma
  // janela nova a cada pedido.
  const ip = ipNovo();
  for (let i = 0; i < 8; i++) {
    await api("/api/orders", {
      method: "POST",
      headers: { "x-forwarded-for": `198.51.100.${i}, 192.0.2.99` },
      body: JSON.stringify(pedidoValido),
    });
  }

  const r = await api("/api/orders", {
    method: "POST",
    headers: { "x-forwarded-for": "198.51.100.200, 192.0.2.99" },
    body: JSON.stringify(pedidoValido),
  });
  assert.equal(r.status, 429, "a cadeia toda conta para o mesmo balde");
});

test("o limite de login é mais apertado que o de pedidos", async () => {
  // 10 tentativas por 15 minutos (bcrypt corre em cada uma).
  const ip = ipNovo();
  let viu429 = false;
  for (let i = 0; i < 12; i++) {
    const r = await api("/api/auth/login", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
      body: JSON.stringify({ email: "ninguem@colo.ao", password: "errada" }),
    });
    if (r.status === 429) {
      viu429 = true;
      assert.match(r.body.erro, /Demasiadas tentativas/i);
      assert.ok(r.headers.get("retry-after"));
      break;
    }
  }
  assert.ok(viu429, "o login tem de passar a devolver 429");
});

test("o limite de /setup é ainda mais apertado (5 por hora)", async () => {
  const ip = ipNovo();
  let viu429 = false;
  for (let i = 0; i < 7; i++) {
    const r = await api("/api/auth/setup", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
      body: JSON.stringify({ email: `dona${i}@colo.ao`, password: "senha-forte" }),
    });
    if (r.status === 429) {
      viu429 = true;
      break;
    }
  }
  assert.ok(viu429, "o setup tem de passar a devolver 429");
});
