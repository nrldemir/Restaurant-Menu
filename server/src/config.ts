import "dotenv/config";
import os from "node:os";
import path from "node:path";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET ortam değişkeni tanımlı değil (server/.env dosyasını kontrol edin)");
}

/** Bilgisayarın yerel ağ (Wi‑Fi/Ethernet) IPv4 adresi; telefondan test için. */
export function lanAddress(): string | null {
  const isPrivate = (ip: string) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
  const isVirtual = (name: string) => /vethernet|virtual|vmware|vbox|wsl|docker|hyper-v|loopback|tailscale|zerotier/i.test(name);
  const candidates = Object.entries(os.networkInterfaces())
    .filter(([name]) => !isVirtual(name))
    .flatMap(([name, addrs]) =>
      (addrs ?? []).filter((a) => a.family === "IPv4" && !a.internal && isPrivate(a.address)).map((a) => ({ name, ip: a.address })),
    )
    // Wi‑Fi / Ethernet adlı arayüzleri öne al
    .sort((a, b) => Number(/wi-?fi|wlan|ethernet|en0|eth0/i.test(b.name)) - Number(/wi-?fi|wlan|ethernet|en0|eth0/i.test(a.name)));
  return candidates[0]?.ip ?? null;
}

const CLIENT_PORT = Number(process.env.CLIENT_PORT ?? 5173);

/**
 * CLIENT_URL="auto" (veya boş) ise yerel ağ adresi kullanılır; böylece QR kodlar aynı
 * Wi‑Fi'deki telefonlardan okutulabilir. Canlıda gerçek alan adını yazın.
 */
function resolveClientUrl() {
  const value = process.env.CLIENT_URL?.trim();
  if (value && value !== "auto") return value.replace(/\/+$/, "");
  const ip = lanAddress();
  return ip ? `http://${ip}:${CLIENT_PORT}` : `http://localhost:${CLIENT_PORT}`;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret,
  clientUrl: resolveClientUrl(),
  uploadDir: path.resolve(__dirname, "../uploads"),
};
