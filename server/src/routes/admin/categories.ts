import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http";
import { categorySchema, reorderSchema } from "../../lib/schemas";
import { cleanTranslations } from "../../lib/translations";
import { deleteUpload } from "../../lib/uploads";
import { getAuth } from "../../middleware/auth";
import { serializeCategory } from "../serializers";

export const categoriesRouter = Router();

async function findOwnedCategory(id: string, restaurantId: string) {
  const category = await prisma.category.findFirst({ where: { id, restaurantId } });
  if (!category) throw new HttpError(404, "Kategori bulunamadı");
  return category;
}

categoriesRouter.get("/", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const categories = await prisma.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" },
    include: { translations: true, _count: { select: { products: true } } },
  });
  res.json(categories.map((c) => ({ ...serializeCategory(c), productCount: c._count.products })));
});

categoriesRouter.post("/", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const data = categorySchema.parse(req.body);
  const restaurant = await prisma.restaurant.findUniqueOrThrow({ where: { id: restaurantId } });
  const last = await prisma.category.findFirst({ where: { restaurantId }, orderBy: { sortOrder: "desc" } });

  const category = await prisma.category.create({
    data: {
      restaurantId,
      isActive: data.isActive ?? true,
      imageUrl: data.imageUrl ?? null,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      translations: { create: cleanTranslations(data.translations, restaurant) },
    },
    include: { translations: true },
  });
  res.status(201).json({ ...serializeCategory(category), productCount: 0 });
});

categoriesRouter.put("/reorder", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const { ids } = reorderSchema.parse(req.body);

  const owned = await prisma.category.count({ where: { restaurantId, id: { in: ids } } });
  if (owned !== new Set(ids).size) throw new HttpError(400, "Geçersiz kategori listesi");

  await prisma.$transaction(
    ids.map((id, index) => prisma.category.update({ where: { id }, data: { sortOrder: index } })),
  );
  res.status(204).end();
});

categoriesRouter.put("/:id", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const data = categorySchema.parse(req.body);
  const current = await findOwnedCategory(req.params.id, restaurantId);
  const restaurant = await prisma.restaurant.findUniqueOrThrow({ where: { id: restaurantId } });

  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: {
      isActive: data.isActive,
      imageUrl: data.imageUrl === undefined ? current.imageUrl : data.imageUrl,
      translations: { deleteMany: {}, create: cleanTranslations(data.translations, restaurant) },
    },
    include: { translations: true, _count: { select: { products: true } } },
  });
  if (current.imageUrl && current.imageUrl !== category.imageUrl) await deleteUpload(current.imageUrl);
  res.json({ ...serializeCategory(category), productCount: category._count.products });
});

categoriesRouter.delete("/:id", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const category = await findOwnedCategory(req.params.id, restaurantId);

  const products = await prisma.product.findMany({
    where: { categoryId: req.params.id },
    select: { imageUrl: true },
  });
  await prisma.category.delete({ where: { id: req.params.id } });
  await Promise.all([category.imageUrl, ...products.map((p) => p.imageUrl)].map(deleteUpload));
  res.status(204).end();
});
