import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http";
import { deleteUpload } from "../lib/uploads";
import { parseLanguages } from "../lib/languages";
import { getSession, requireAuth, requireSuperAdmin, signToken } from "../middleware/auth";
import { menuUrl } from "./serializers";

/** Süper admin: tüm restoranları görme ve yönetme. */
export const superRouter = Router();

superRouter.use(requireAuth, requireSuperAdmin);

superRouter.get("/stats", async (_req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [restaurants, active, newThisWeek, categories, products, owners] = await Promise.all([
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { isActive: true } }),
    prisma.restaurant.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.category.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "owner" } }),
  ]);
  res.json({ restaurants, active, newThisWeek, categories, products, owners });
});

superRouter.get("/restaurants", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const restaurants = await prisma.restaurant.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { slug: { contains: q.toLowerCase() } },
            { users: { some: { email: { contains: q.toLowerCase() } } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { email: true }, orderBy: { createdAt: "asc" } },
      _count: { select: { categories: true, products: true } },
    },
  });

  res.json(
    restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      logoUrl: r.logoUrl,
      theme: r.theme,
      isActive: r.isActive,
      languages: parseLanguages(r.languages),
      currency: r.currency,
      owners: r.users.map((u) => u.email),
      categoryCount: r._count.categories,
      productCount: r._count.products,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      menuUrl: menuUrl(r.slug),
    })),
  );
});

async function findRestaurant(id: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new HttpError(404, "Restoran bulunamadı");
  return restaurant;
}

/** Yayına al / yayından kaldır */
superRouter.patch("/restaurants/:id", async (req, res) => {
  const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
  await findRestaurant(req.params.id);
  const updated = await prisma.restaurant.update({ where: { id: req.params.id }, data: { isActive } });
  res.json({ id: updated.id, isActive: updated.isActive });
});

/** Restoranı, sahip hesaplarını ve tüm görsellerini kalıcı olarak siler. */
superRouter.delete("/restaurants/:id", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    include: {
      products: { select: { imageUrl: true } },
      categories: { select: { imageUrl: true } },
    },
  });
  if (!restaurant) throw new HttpError(404, "Restoran bulunamadı");

  // Restorana bağlı süper admin hesapları silinmesin, sadece bağlantısı kopsun
  await prisma.user.updateMany({
    where: { restaurantId: restaurant.id, role: "superadmin" },
    data: { restaurantId: null },
  });
  await prisma.restaurant.delete({ where: { id: restaurant.id } });
  await Promise.all(
    [
      restaurant.logoUrl,
      restaurant.coverUrl,
      ...restaurant.products.map((p) => p.imageUrl),
      ...restaurant.categories.map((c) => c.imageUrl),
    ].map(deleteUpload),
  );
  res.status(204).end();
});

/**
 * Restoranın paneline sahibinin şifresi olmadan girmek için kısa ömürlü (2 saat) token.
 * Bu token ile süper admin rotaları kullanılamaz.
 */
superRouter.post("/restaurants/:id/impersonate", async (req, res) => {
  const session = getSession(req);
  const restaurant = await findRestaurant(req.params.id);
  const owner = await prisma.user.findFirst({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "asc" },
  });
  if (!owner) throw new HttpError(404, "Bu restoranın bir kullanıcısı yok");

  const token = signToken(
    { userId: owner.id, restaurantId: restaurant.id, role: "owner", impersonatedBy: session.userId },
    "2h",
  );
  res.json({ token });
});
