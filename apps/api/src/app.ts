import cors from "cors";
import express from "express";
import path from "node:path";
import { authRouter } from "./routes/auth.js";
import { configRouter } from "./routes/config.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { ordersRouter } from "./routes/orders.js";
import { siteRouter } from "./routes/site.js";
import { uploadRouter } from "./routes/upload.js";
import { weeksRouter } from "./routes/weeks.js";
import { contentRouter } from "./routes/content.js";

export function createApp() {
  const app = express();

  // O tráfego chega do Caddy, não directamente do cliente. Sem isto, `req.ip`
  // seria sempre o endereço do Caddy e o rate limit (ver middleware/rateLimit)
  // contaria todos os clientes como um só, bloqueando o site inteiro. O `1`
  // limita a confiança ao primeiro salto, ou seja, o X-Forwarded-For que o
  // Caddy reescreve — um cabeçalho falsificado pelo cliente não engana.
  app.set("trust proxy", 1);

  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
  app.use(express.json());

  app.use(
    "/uploads",
    express.static(path.resolve("uploads"), {
      // Defesa em profundidade: mesmo que um ficheiro não-imagem passe pela
      // validação do upload, estes cabeçalhos impedem que o browser o
      // interprete como HTML/JS ao servi-lo.
      setHeaders: (res) => {
        res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'");
        res.setHeader("X-Content-Type-Options", "nosniff");
      },
    })
  );
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/site", siteRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/config", configRouter);
  app.use("/api/weeks", weeksRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/uploads", uploadRouter);
  app.use("/api/edit-content", contentRouter);

  // Serve React frontend
  const webDist = path.resolve(process.cwd(), "../web/dist");
  app.use(express.static(webDist));
  app.use((_req, res, next) => {
    if (_req.method === "GET" && !_req.path.startsWith("/api")) {
      res.sendFile(path.join(webDist, "index.html"));
    } else {
      next();
    }
  });

  return app;
}
