import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/** Só funciona enquanto não existir nenhuma conta — cria a primeira (a dona). */
authRouter.post("/setup", async (req, res) => {
  const jaExiste = await prisma.admin.findFirst();
  if (jaExiste) {
    res.status(409).json({ erro: "O painel já tem uma conta configurada." });
    return;
  }
  const parsed = setupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Email ou palavra-passe inválidos (mínimo 6 caracteres)." });
    return;
  }
  const { email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({ data: { email: email.toLowerCase(), passwordHash } });
  res.json({ token: signToken({ adminId: admin.id }) });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Dados inválidos." });
    return;
  }
  const { email, password } = parsed.data;
  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    res.status(401).json({ erro: "Utilizador ou palavra-passe incorretos." });
    return;
  }
  res.json({ token: signToken({ adminId: admin.id }) });
});

authRouter.get("/setup-needed", async (_req, res) => {
  const jaExiste = await prisma.admin.findFirst();
  res.json({ setupNeeded: !jaExiste });
});

const passwordSchema = z.object({
  atual: z.string().min(1),
  nova: z.string().min(6),
});

authRouter.post("/password", requireAuth, async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "A nova palavra-passe precisa de pelo menos 6 caracteres." });
    return;
  }
  const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
  if (!admin || !(await bcrypt.compare(parsed.data.atual, admin.passwordHash))) {
    res.status(401).json({ erro: "A palavra-passe atual está incorreta." });
    return;
  }
  const passwordHash = await bcrypt.hash(parsed.data.nova, 10);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });
  res.json({ ok: true });
});
