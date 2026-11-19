import { Router } from "express";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http";
import { menuUrl, serializeCategory, serializeProduct, serializeRestaurant } from "./serializers";

export const publicRouter = Router();

/** Müşterilerin gördüğü menü: aktif kategoriler ve ürünleri, tüm dillerdeki çevirileriyle. */
publicRouter.get("/restaurants/:slug/menu", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: req.params.slug },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          translations: true,
          products: { orderBy: { sortOrder: "asc" }, include: { translations: true } },
        },
      },
    },
  });
  if (!restaurant) throw new HttpError(404, "Restoran bulunamadı");

  const { id: _id, menuUrl: _url, ...info } = serializeRestaurant(restaurant);
  res.json({
    restaurant: info,
    categories: restaurant.categories
      .filter((c) => c.products.length > 0)
      .map((c) => ({ ...serializeCategory(c), products: c.products.map(serializeProduct) })),
  });
});

const THEME_COLORS: Record<string, string> = {
  nar: "#C2361A",
  safran: "#A85F00",
  zeytin: "#4A7536",
  ege: "#17658A",
  murdum: "#7E2C5F",
  antrasit: "#2F2924",
};

/** Müşteri menüyü telefonunun ana ekranına eklediğinde restoranın adı ve rengiyle açılsın. */
publicRouter.get("/restaurants/:slug/manifest.webmanifest", async (req, res) => {
  const r = await prisma.restaurant.findUnique({ where: { slug: req.params.slug } });
  if (!r) throw new HttpError(404, "Restoran bulunamadı");

  const icons = r.logoUrl
    ? [{ src: r.logoUrl, sizes: "512x512", purpose: "any" }]
    : [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ];

  res.type("application/manifest+json").send(
    JSON.stringify({
      name: r.name,
      short_name: r.name.length > 14 ? r.name.slice(0, 14) : r.name,
      description: r.description ?? undefined,
      lang: r.defaultLanguage,
      start_url: `/menu/${r.slug}`,
      scope: `/menu/${r.slug}`,
      display: "standalone",
      background_color: "#fbf8f4",
      theme_color: THEME_COLORS[r.theme] ?? THEME_COLORS.nar,
      icons,
    }),
  );
});

/**
 * Menü linkine giden QR kod. Herkese açık; sadece menünün public adresini içerir.
 * ?table=5      -> masaya özel link (/menu/slug?table=5)
 * ?format=svg   -> SVG (varsayılan PNG)
 * ?download=1   -> dosya olarak indir
 */
publicRouter.get("/restaurants/:slug/qr", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: req.params.slug },
    select: { slug: true },
  });
  if (!restaurant) throw new HttpError(404, "Restoran bulunamadı");

  const table = typeof req.query.table === "string" ? req.query.table.trim() : "";
  if (table && !/^[\p{L}\p{N} _-]{1,30}$/u.test(table)) {
    throw new HttpError(400, "Geçersiz masa adı");
  }

  const url = new URL(menuUrl(restaurant.slug));
  if (table) url.searchParams.set("table", table);

  const format = req.query.format === "svg" ? "svg" : "png";
  if (req.query.download === "1") {
    res.attachment(`qr-${restaurant.slug}${table ? `-masa-${table}` : ""}.${format}`);
  }

  const options = { margin: 2, width: 512, errorCorrectionLevel: "M" as const };
  if (format === "svg") {
    res.type("image/svg+xml").send(await QRCode.toString(url.toString(), { ...options, type: "svg" }));
  } else {
    res.type("png").send(await QRCode.toBuffer(url.toString(), { ...options, type: "png" }));
  }
});
