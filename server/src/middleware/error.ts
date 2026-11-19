import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { HttpError } from "../lib/http";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    res.status(400).json({ error: first?.message ?? "Geçersiz veri", details: err.issues });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Dosya en fazla 5 MB olabilir" : err.message;
    res.status(400).json({ error: message });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "Geçersiz JSON" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Sunucu hatası" });
};
