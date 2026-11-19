import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const api = "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Aynı ağdaki telefondan QR ile test edebilmek için
    host: true,
    proxy: {
      "/api": api,
      "/uploads": api,
    },
  },
});
