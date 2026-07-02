import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const configRouter = Router();
configRouter.use(requireAuth);

const configSchema = z.object({
  whatsapp: z
    .string()
    .transform((s) => s.replace(/\D+/g, ""))
    .default(""),
  instagram: z.string().trim().default(""),
  dominio: z.string().trim().default(""),
  moeda: z.string().trim().default("Kz"),
  mensagemDaSemana: z.string().trim().default(""),
  pagamento: z
    .array(z.object({ etiqueta: z.string().trim(), valor: z.string().trim() }))
    .default([]),
  modoAutomaticoSemanas: z.coerce.boolean().default(true),
});

configRouter.put("/", async (req, res) => {
  const parsed = configSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Dados de configuração inválidos." });
    return;
  }
  const config = await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });
  res.json(config);
});
