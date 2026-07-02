import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAuth } from "../middleware/auth.js";

const uploadDir = path.resolve("uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Apenas imagens são permitidas."));
      return;
    }
    cb(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post("/", requireAuth, (req, res) => {
  upload.single("foto")(req, res, (err) => {
    if (err) {
      const msg = err instanceof multer.MulterError ? "Ficheiro demasiado grande (máx 5 MB)." : err.message;
      res.status(400).json({ erro: msg });
      return;
    }
    if (!req.file) {
      res.status(400).json({ erro: "Nenhum ficheiro enviado." });
      return;
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});
