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
