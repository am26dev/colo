import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getActiveWeek } from "../lib/activeWeek.js";
import { expirarReservas, prazoReserva, vagasDisponiveis, devolverVaga, fecharSeEsgotou } from "../lib/reservas.js";
import { rateLimit } from "../middleware/rateLimit.js";

export const ordersRouter = Router();

/**
 * A rota é pública (é o checkout), mas cada pedido consome uma vaga. Sem este
 * limite, um script repetido esgotaria a semana com pedidos falsos — o
 * compare-and-swap abaixo trava o oversell, mas não trava o esgotamento.
 * 8 por hora por IP é folgado para uma cliente real e largo para ataques.
 */
const pedidosLimite = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: "Demasiados pedidos enviados a partir deste dispositivo. Tenta mais tarde ou fala directamente com a Colo no WhatsApp.",
});

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
 *  servidor (nunca confia no weekId do cliente) e cria uma *reserva* com prazo.
 *  A reserva não consome vaga: só a confirmação o faz (ver PATCH abaixo). */
ordersRouter.post("/", pedidosLimite, async (req, res) => {
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
  if (!week || week.estado !== "aberto") {
    res.status(409).json({ erro: "Os pedidos desta semana estão encerrados." });
    return;
  }

  // Lugares prometidos = vagas confirmadas que sobram menos as reservas vivas.
  // A reserva em si não é condicionada atómicamente por esta contagem: entre a
  // leitura e a escrita podem entrar mais pedidos, e o que decide é o
  // compare-and-swap da confirmação. O efeito de dois escaparem é a dona
  // confirmar um pedido a mais e o sistema recusar com 409 — nunca o contrário.
  const disponiveis = await vagasDisponiveis(week);
  if (disponiveis <= 0) {
    res.status(409).json({ erro: "Os pedidos desta semana estão encerrados." });
    return;
  }

  const order = await prisma.order.create({
    data: {
      tipo,
      nome,
      contacto,
      ciclo,
      notas,
      weekId: week.id,
      estado: "novo",
      expiresAt: prazoReserva(),
    },
  });
  res.json({ order });
});

const listQuerySchema = z.object({
  semana: z.string().optional(),
  estado: z.enum(["novo", "confirmado", "cancelado", "expirado"]).optional(),
  tipo: z.enum(["semana", "especial"]).optional(),
});

ordersRouter.get("/", requireAuth, async (req, res) => {
  const q = listQuerySchema.safeParse(req.query);
  if (!q.success) {
    res.status(400).json({ erro: "Filtros inválidos." });
    return;
  }
  await expirarReservas();
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

const updateOrderSchema = z.object({
  estado: z.enum(["novo", "confirmado", "cancelado", "expirado"]),
});

/**
 * Confirmar é o único momento em que uma vaga é consumida, e sai daqui de
 * forma atómica; sair de "confirmado" devolve-a. As duas transições de estado
 * são feitas com `updateMany` condicionado ao estado actual (compare-and-swap
 * sobre o próprio pedido), para que dois PATCH simultâneos do mesmo pedido não
 * descontem duas vagas nem devolvam a mesma duas vezes.
 */
ordersRouter.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Estado inválido." });
    return;
  }
  const id = String(req.params.id);
  const novo = parsed.data.estado;

  const atual = await prisma.order.findUnique({ where: { id } });
  if (!atual) {
    res.status(404).json({ erro: "Pedido não encontrado." });
    return;
  }

  // Reservar -> confirmado: consome uma vaga.
  if (novo === "confirmado" && atual.estado !== "confirmado") {
    if (atual.weekId) {
      const marcado = await prisma.order.updateMany({
        where: { id, estado: atual.estado },
        data: { estado: novo, expiresAt: null },
      });
      if (marcado.count === 0) {
        res.status(409).json({ erro: "O pedido mudou de estado entretanto. Actualiza a página." });
        return;
      }

      const vaga = await prisma.week.updateMany({
        where: { id: atual.weekId, vagasRestantes: { gt: 0 } },
        data: { vagasRestantes: { decrement: 1 } },
      });
      if (vaga.count === 0) {
        // Sem vaga livre: desfaz a marcação para o pedido voltar a reserva.
        await prisma.order.updateMany({
          where: { id },
          data: { estado: atual.estado, expiresAt: atual.expiresAt },
        });
        res.status(409).json({ erro: "Não há vagas livres para confirmar este pedido." });
        return;
      }

      await fecharSeEsgotou(atual.weekId);
    } else {
      // Pedido especial não ocupa vaga nenhuma.
      await prisma.order.updateMany({
        where: { id, estado: atual.estado },
        data: { estado: novo, expiresAt: null },
      });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    res.json({ order });
    return;
  }

  // Confirmado -> qualquer outro estado: a vaga volta à semana.
  if (atual.estado === "confirmado" && novo !== "confirmado") {
    const marcado = await prisma.order.updateMany({
      where: { id, estado: "confirmado" },
      data: { estado: novo, expiresAt: novo === "novo" ? prazoReserva() : null },
    });
    if (marcado.count === 0) {
      res.status(409).json({ erro: "O pedido mudou de estado entretanto. Actualiza a página." });
      return;
    }
    if (atual.weekId) {
      await devolverVaga(atual.weekId);
    }
    const order = await prisma.order.findUnique({ where: { id } });
    res.json({ order });
    return;
  }

  // Transições que não mexem em vagas. Voltar a "novo" renova o prazo.
  const order = await prisma.order.update({
    where: { id },
    data: { estado: novo, expiresAt: novo === "novo" ? prazoReserva() : null },
  });
  res.json({ order });
});

ordersRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = String(req.params.id);
  const order = await prisma.order.findUnique({ where: { id } });
  // Apagar um pedido confirmado tem de devolver a vaga, senão o lugar
  // desaparece da semana sem o painel dar por isso. `devolverVaga` é a mesma
  // função que o cancelamento usa, para os dois casos não divergirem.
  await prisma.order.delete({ where: { id } }).catch(() => null);
  if (order?.estado === "confirmado" && order.weekId) {
    await devolverVaga(order.weekId);
  }
  res.json({ ok: true });
});
