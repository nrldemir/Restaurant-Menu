import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { config } from "../config";
import { HttpError } from "./http";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: config.uploadDir,
    filename: (_req, file, cb) => {
      cb(null, `${crypto.randomUUID()}${ALLOWED_TYPES[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) cb(null, true);
    else cb(new HttpError(400, "Sadece JPG, PNG, WEBP veya GIF yükleyebilirsiniz"));
  },
});

/** /uploads/... adresindeki dosyayı siler; dosya yoksa sessizce geçer. */
export async function deleteUpload(url: string | null | undefined) {
  if (!url?.startsWith("/uploads/")) return;
  const file = path.join(config.uploadDir, path.basename(url));
  await fs.unlink(file).catch(() => undefined);
}
