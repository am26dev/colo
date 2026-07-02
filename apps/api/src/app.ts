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

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
  app.use(express.json());

  app.use("/uploads", express.static(path.resolve("uploads")));
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/site", siteRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/config", configRouter);
  app.use("/api/weeks", weeksRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/uploads", uploadRouter);

  return app;
}
