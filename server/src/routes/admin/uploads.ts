import { Router } from "express";
import { HttpError } from "../../lib/http";
import { imageUpload } from "../../lib/uploads";

export const uploadsRouter = Router();

/** Görsel yükler ve /uploads/... adresini döner. Ürün veya logo kaydederken bu adres gönderilir. */
uploadsRouter.post("/", imageUpload.single("image"), (req, res) => {
  if (!req.file) throw new HttpError(400, "Görsel dosyası gönderilmedi (alan adı: image)");
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
