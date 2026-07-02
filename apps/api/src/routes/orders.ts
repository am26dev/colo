import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getActiveWeek } from "../lib/activeWeek.js";

export const ordersRouter = Router();

const createOrderSchema = z
  .object({
    tipo: z.enum(["semana", "especial"]),
    nome: z.string().trim().min(1),
    contacto: z.string().trim().min(1),
    ciclo: z.string().trim().default(""),
    notas: z.string().trim().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "especial" && !data.notas) {
      ctx.addIssue({ code: "custom", path: ["notas"], message: "Descreve o que precisas." });
    }
  });

/** Público: cria um pedido. Para tipo "semana", resolve a semana activa no
 *  servidor (nunca confia no weekId do cliente) e desconta 1 vaga, fechando
 *  a semana automaticamente ao chegar a 0. */
ordersRouter.post("/", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Dados do pedido inválidos." });
    return;
  }
  const { tipo, nome, contacto, ciclo, notas } = parsed.data;

  if (tipo === "especial") {
    const order = await prisma.order.create({
      data: { tipo, nome, contacto, ciclo, notas, weekId: null },
    });
    res.json({ order });
    return;
  }

  const week = await getActiveWeek();
  if (!week || week.estado !== "aberto" || week.vagasRestantes <= 0) {
    res.status(409).json({ erro: "Os pedidos desta semana estão encerrados." });
    return;
  }

  const [order] = await prisma.$transaction([
    prisma.order.create({ data: { tipo, nome, contacto, ciclo, notas, weekId: week.id } }),
    prisma.week.update({
      where: { id: week.id },
      data: {
        vagasRestantes: { decrement: 1 },
        ...(week.vagasRestantes - 1 <= 0 ? { estado: "fechado" } : {}),
      },
    }),
  ]);
  res.json({ order });
});

const listQuerySchema = z.object({
  semana: z.string().optional(),
  estado: z.enum(["novo", "confirmado", "cancelado"]).optional(),
  tipo: z.enum(["semana", "especial"]).optional(),
});

ordersRouter.get("/", requireAuth, async (req, res) => {
  const q = listQuerySchema.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ erro: "Filtros inválidos." });
    return;
  }
  const orders = await prisma.order.findMany({
    where: {
      ...(q.data.semana ? { weekId: q.data.semana } : {}),
      ...(q.data.estado ? { estado: q.data.estado } : {}),
      ...(q.data.tipo ? { tipo: q.data.tipo } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { week: { select: { dataInicio: true, dataFim: true } } },
  });
  res.json({ orders });
});

const updateOrderSchema = z.object({ estado: z.enum(["novo", "confirmado", "cancelado"]) });

ordersRouter.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Estado inválido." });
    return;
  }
  const id = String(req.params.id);
  const order = await prisma.order.update({ where: { id }, data: { estado: parsed.data.estado } }).catch(() => null);
  if (!order) {
    res.status(404).json({ erro: "Pedido não encontrado." });
    return;
  }
  res.json({ order });
});

ordersRouter.delete("/:id", requireAuth, async (req, res) => {
  await prisma.order.delete({ where: { id: String(req.params.id) } }).catch(() => null);
  res.json({ ok: true });
});
