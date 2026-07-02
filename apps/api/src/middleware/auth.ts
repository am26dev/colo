import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ erro: "Sessão expirada. Inicia sessão novamente." });
    return;
  }
  try {
    const payload = verifyToken(token);
    req.adminId = payload.adminId;
    next();
  } catch {
    res.status(401).json({ erro: "Sessão expirada. Inicia sessão novamente." });
  }
}
