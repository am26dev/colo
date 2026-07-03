import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const weeksRouter = Router();
weeksRouter.use(requireAuth);

const refeicaoSchema = z.object({
  tipo: z.enum(["almoco", "sobremesa"]),
  nome: z.string().trim().default(""),
  descricao: z.string().trim().default(""),
  foto: z.string().trim().default(""),
});

const diaSchema = z.object({
  diaSemana: z.number().int().min(1).max(5),
  tema: z.string().trim().default(""),
  icone: z.string().trim().default(""),
  frase: z.string().trim().default(""),
  refeicoes: z.array(refeicaoSchema),
});

const weekSchema = z.object({
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
  precoSemanal: z.coerce.number().int().min(0).default(100000),
  estado: z.enum(["aberto", "fechado", "oculto"]).default("aberto"),
  vagasTotais: z.coerce.number().int().min(0).default(0),
  vagasRestantes: z.coerce.number().int().min(0).default(0),
  dias: z.array(diaSchema).length(5),
});

function diasInclude() {
  return { dias: { orderBy: { diaSemana: "asc" as const } } };
}

weeksRouter.get("/", async (_req, res) => {
  const weeks = await prisma.week.findMany({
    orderBy: { dataInicio: "asc" },
    include: { ...diasInclude(), _count: { select: { pedidos: true } } },
  });
  res.json({ weeks });
});

weeksRouter.get("/:id", async (req, res) => {
  const id = String(req.params.id);
  const week = await prisma.week.findUnique({ where: { id }, include: diasInclude() });
  if (!week) {
    res.status(404).json({ erro: "Semana não encontrada." });
    return;
  }
  res.json({ week });
});

weeksRouter.post("/", async (req, res) => {
  const parsed = weekSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Dados da semana inválidos." });
    return;
  }
  const { dias, ...dados } = parsed.data;
  const week = await prisma.week.create({
    data: { ...dados, dias: { create: dias } },
    include: diasInclude(),
  });
  res.json({ week });
});

weeksRouter.put("/:id", async (req, res) => {
  const id = String(req.params.id);
  const parsed = weekSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Dados da semana inválidos." });
    return;
  }
  const { dias, ...dados } = parsed.data;
  const existe = await prisma.week.findUnique({ where: { id } });
  if (!existe) {
    res.status(404).json({ erro: "Semana não encontrada." });
    return;
  }
  const week = await prisma.$transaction(async (tx) => {
    await tx.day.deleteMany({ where: { weekId: id } });
    return tx.week.update({
      where: { id },
      data: { ...dados, dias: { create: dias } },
      include: diasInclude(),
    });
  });
  res.json({ week });
});

weeksRouter.delete("/:id", async (req, res) => {
  const id = String(req.params.id);
  const pedidos = await prisma.order.count({ where: { weekId: id } });
  if (pedidos > 0) {
    res.status(409).json({ erro: "Esta semana já tem pedidos associados e não pode ser eliminada." });
    return;
  }
  await prisma.week.delete({ where: { id } }).catch(() => null);
  res.json({ ok: true });
});

/** Modo manual: activa esta semana e desactiva todas as outras. */
weeksRouter.post("/:id/ativar", async (req, res) => {
  const id = String(req.params.id);
  const existe = await prisma.week.findUnique({ where: { id } });
  if (!existe) {
    res.status(404).json({ erro: "Semana não encontrada." });
    return;
  }
  await prisma.$transaction([
    prisma.week.updateMany({ data: { ativaManual: false }, where: {} }),
    prisma.week.update({ where: { id }, data: { ativaManual: true } }),
  ]);
  res.json({ ok: true });
});

weeksRouter.post("/:id/toggle-estado", async (req, res) => {
  const id = String(req.params.id);
  const atual = await prisma.week.findUnique({ where: { id } });
  if (!atual) {
    res.status(404).json({ erro: "Semana não encontrada." });
    return;
  }
  const novoEstado = atual.estado === "aberto" ? "fechado" : "aberto";
  const week = await prisma.week.update({ where: { id }, data: { estado: novoEstado } });
  res.json({ week });
});
