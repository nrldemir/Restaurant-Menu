import "dotenv/config";
import path from "node:path";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET ortam değişkeni tanımlı değil (server/.env dosyasını kontrol edin)");
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret,
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  uploadDir: path.resolve(__dirname, "../uploads"),
};
