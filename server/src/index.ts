import fs from "node:fs";
import { app } from "./app";
import { config } from "./config";

fs.mkdirSync(config.uploadDir, { recursive: true });

app.listen(config.port, () => {
  console.log(`API çalışıyor: http://localhost:${config.port}`);
});
