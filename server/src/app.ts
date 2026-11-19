import express from "express";
import cors from "cors";
import { config } from "./config";
import { authRouter } from "./routes/auth";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";
import { superRouter } from "./routes/super";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(cors({ origin: config.clientUrl }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(config.uploadDir, { maxAge: "7d" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter);
app.use("/api/admin", adminRouter);
app.use("/api/super", superRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Bulunamadı" });
});
app.use(errorHandler);
