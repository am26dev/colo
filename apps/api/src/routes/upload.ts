import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";
import { requireAuth } from "../middleware/auth.js";

const uploadDir = path.resolve("uploads");

// Whitelist fechada — nunca aceitar .svg (pode conter <script>) nem qualquer
// outra extensão que um browser possa interpretar como HTML/JS.
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// Assinatura (magic bytes) de cada formato aceite — confirma o conteúdo real
// do ficheiro em vez de confiar na extensão/mimetype (ambos vêm do cliente e
// podem ser falsificados: um "foto.jpg" pode conter SVG/HTML com <script>).
function hasValidImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isGif = buffer.toString("ascii", 0, 6) === "GIF87a" || buffer.toString("ascii", 0, 6) === "GIF89a";
  const isWebp = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  return isJpeg || isPng || isGif || isWebp;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ALLOWED_EXT.has(ext) ? ext : ".jpg"}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Só são permitidas imagens JPG, PNG, WEBP ou GIF."));
      return;
    }
    cb(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post("/", requireAuth, (req, res) => {
  upload.single("foto")(req, res, async (err) => {
    if (err) {
      const msg = err instanceof multer.MulterError ? "Ficheiro demasiado grande (máx 5 MB)." : err.message;
      res.status(400).json({ erro: msg });
      return;
    }
    if (!req.file) {
      res.status(400).json({ erro: "Nenhum ficheiro enviado." });
      return;
    }

    // Confirmar o conteúdo real do ficheiro gravado (defesa em profundidade
    // contra extensão/mimetype falsificados) antes de o disponibilizar.
    const savedPath = path.join(uploadDir, req.file.filename);
    const head = await readFile(savedPath).then((b) => b.subarray(0, 12));
    if (!hasValidImageSignature(head)) {
      await unlink(savedPath).catch(() => null);
      res.status(400).json({ erro: "O ficheiro não é uma imagem válida." });
      return;
    }

    res.json({ url: `/uploads/${req.file.filename}` });
  });
});
