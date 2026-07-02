import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getActiveWeek } from "../lib/activeWeek.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", async (_req, res) => {
  const week = await getActiveWeek();
  const [pedidosSemanaAtiva, totalPedidos, pedidosNovos] = await Promise.all([
    week ? prisma.order.count({ where: { weekId: week.id } }) : Promise.resolve(0),
    prisma.order.count(),
    prisma.order.count({ where: { estado: "novo" } }),
  ]);

  res.json({
    semanaAtiva: week
      ? {
          id: week.id,
          dataInicio: week.dataInicio,
          dataFim: week.dataFim,
          estado: week.estado,
          vagasTotais: week.vagasTotais,
          vagasRestantes: week.vagasRestantes,
        }
      : null,
    pedidosSemanaAtiva,
    pedidosNovos,
    totalPedidos,
  });
});
