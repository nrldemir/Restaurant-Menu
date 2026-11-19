import fs from "node:fs";
import { app } from "./app";
import { config } from "./config";

fs.mkdirSync(config.uploadDir, { recursive: true });

app.listen(config.port, () => {
  console.log(`API çalışıyor: http://localhost:${config.port}`);
  console.log(`Menü linkleri ve QR kodlar: ${config.clientUrl}`);
  if (!config.clientUrl.includes("localhost")) {
    console.log(`Telefondan test (aynı Wi-Fi): ${config.clientUrl}  ·  panel: ${config.clientUrl}/admin`);
  }
});
