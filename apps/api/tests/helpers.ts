import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";
import { createApp } from "../src/app.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raizApi = path.resolve(aqui, "..");

/**
 * A BD de testes é um ficheiro à parte, definido em `npm test` (DATABASE_URL).
 * O esquema é criado pelas migrations de verdade, para os testes correrem
 * contra a mesma base de dados que a produção — se uma migration divergir do
 * schema, os testes falham aqui em vez de no primeiro deploy.
 */
export function migraSeNecessario() {
  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: raizApi,
    env: process.env,
    stdio: "ignore",
  });
}

/** Limpa os dados mas mantém o esquema. Ordem inversa das dependências. */
export async function limpaDados() {
  await prisma.order.deleteMany();
  await prisma.day.deleteMany();
  await prisma.week.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.admin.deleteMany();
}

let servidor: ReturnType<ReturnType<typeof createApp>["listen"]> | null = null;
let base = "";

/** Sobe a app numa porta efémera. Devolve a URL base para os fetch. */
export async function arrancaApi() {
  if (base) return base;
  const app = createApp();
  servidor = app.listen(0);
  await new Promise<void>((r) => servidor!.once("listening", () => r()));
  const addr = servidor.address();
  if (typeof addr === "string" || addr === null) throw new Error("sem porta");
  base = `http://127.0.0.1:${addr.port}`;
  return base;
}

export async function fechaApi() {
  if (!servidor) return;
  await new Promise<void>((r) => servidor!.close(() => r()));
  servidor = null;
  base = "";
}

export interface Resposta<T = any> {
  status: number;
  body: T;
  headers: Headers;
}

export async function api<T = any>(
  caminho: string,
  init: RequestInit & { token?: string } = {},
): Promise<Resposta<T>> {
  const { token, ...resto } = init;
  const headers = new Headers(resto.headers);
  if (resto.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);

  const r = await fetch(`${base}${caminho}`, { ...resto, headers });
  const texto = await r.text();
  let body: any = texto;
  try {
    body = texto ? JSON.parse(texto) : null;
  } catch {
    /* resposta não-JSON (ex.: HTML do SPA) fica como texto */
  }
  return { status: r.status, body, headers: r.headers };
}

/**
 * Cria a semana activa de hoje. `getActiveWeek` escolhe a Week cujo intervalo
 * contém hoje em UTC, portanto as datas têm de envolver o dia de agora.
 */
export async function criaSemanaActiva(over: Partial<{ vagasTotais: number; vagasRestantes: number; estado: string }> = {}) {
  const hoje = new Date();
  const inicio = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() - 3));
  const fim = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + 3));
  return prisma.week.create({
    data: {
      dataInicio: inicio,
      dataFim: fim,
      precoSemanal: 100000,
      estado: over.estado ?? "aberto",
      vagasTotais: over.vagasTotais ?? 10,
      vagasRestantes: over.vagasRestantes ?? over.vagasTotais ?? 10,
    },
  });
}

export async function criaAdmin(password = "senha-de-teste-forte") {
  return prisma.admin.create({
    data: { email: "dona@colo.ao", passwordHash: await bcrypt.hash(password, 10) },
  });
}

export async function login(email = "dona@colo.ao", password = "senha-de-teste-forte") {
  const r = await api<{ token: string }>("/api/auth/login", {
    method: "POST",
    // IP próprio por chamada: o login está atrás de um limite de 10 tentativas
    // por 15 minutos, e uma suíte com muitos testes esbarraria nele.
    headers: { "x-forwarded-for": ipNovo() },
    body: JSON.stringify({ email, password }),
  });
  if (r.status !== 200) throw new Error(`login falhou: ${r.status} ${JSON.stringify(r.body)}`);
  return r.body.token;
}

export const pedidoValido = {
  tipo: "semana",
  nome: "Ana Silva",
  contacto: "+244 900 000 000",
  ciclo: "menstrual",
  notas: "",
};

/**
 * O limitador de pedidos conta por IP, e o limite real (8/hora) é testado a
 * fundo em rateLimit.test.ts. Nos restantes testes cada chamada usa um IP
 * próprio para não esbarrar nesse limite, que não é o que está a ser testado.
 */
let ipSeq = 0;
function ipNovo() {
  ipSeq += 1;
  return `203.0.113.${ipSeq}`;
}

export function criaPedido(over: Partial<typeof pedidoValido> = {}) {
  return api("/api/orders", {
    method: "POST",
    headers: { "x-forwarded-for": ipNovo() },
    body: JSON.stringify({ ...pedidoValido, ...over }),
  });
}

/** Estado de uma semana, lido fresco da BD (nunca do valor devolvido). */
export async function vagasDe(weekId: string) {
  const w = await prisma.week.findUniqueOrThrow({ where: { id: weekId } });
  return { vagasRestantes: w.vagasRestantes, estado: w.estado };
}
