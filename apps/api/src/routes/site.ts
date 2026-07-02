import { Router } from "express";
import { buildSitePayload } from "../lib/serialize.js";

export const siteRouter = Router();

siteRouter.get("/", async (_req, res) => {
  const payload = await buildSitePayload();
  res.json(payload);
});
