import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http";
import { productSchema, reorderSchema } from "../../lib/schemas";
import { cleanTranslations } from "../../lib/translations";
import { deleteUpload } from "../../lib/uploads";
import { getAuth } from "../../middleware/auth";
import { serializeProduct } from "../serializers";

export const productsRouter = Router();

async function findOwnedProduct(id: string, restaurantId: string) {
  const product = await prisma.product.findFirst({ where: { id, restaurantId } });
  if (!product) throw new HttpError(404, "Ürün bulunamadı");
  return product;
}

async function assertOwnedCategory(categoryId: string, restaurantId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, restaurantId } });
  if (!category) throw new HttpError(400, "Geçersiz kategori");
}

productsRouter.get("/", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;

  const products = await prisma.product.findMany({
    where: { restaurantId, ...(categoryId ? { categoryId } : {}) },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
    include: { translations: true },
  });
  res.json(products.map(serializeProduct));
});

productsRouter.post("/", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const data = productSchema.parse(req.body);
  await assertOwnedCategory(data.categoryId, restaurantId);
  const restaurant = await prisma.restaurant.findUniqueOrThrow({ where: { id: restaurantId } });
  const last = await prisma.product.findFirst({
    where: { categoryId: data.categoryId },
    orderBy: { sortOrder: "desc" },
  });

  const product = await prisma.product.create({
    data: {
      restaurantId,
      categoryId: data.categoryId,
      price: data.price,
      imageUrl: data.imageUrl ?? null,
      isAvailable: data.isAvailable ?? true,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      translations: { create: cleanTranslations(data.translations, restaurant) },
    },
    include: { translations: true },
  });
  res.status(201).json(serializeProduct(product));
});

productsRouter.put("/reorder", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const { ids } = reorderSchema.parse(req.body);

  const owned = await prisma.product.count({ where: { restaurantId, id: { in: ids } } });
  if (owned !== new Set(ids).size) throw new HttpError(400, "Geçersiz ürün listesi");

  await prisma.$transaction(
    ids.map((id, index) => prisma.product.update({ where: { id }, data: { sortOrder: index } })),
  );
  res.status(204).end();
});

productsRouter.put("/:id", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const data = productSchema.parse(req.body);
  const current = await findOwnedProduct(req.params.id, restaurantId);
  await assertOwnedCategory(data.categoryId, restaurantId);
  const restaurant = await prisma.restaurant.findUniqueOrThrow({ where: { id: restaurantId } });

  const product = await prisma.product.update({
    where: { id: current.id },
    data: {
      categoryId: data.categoryId,
      price: data.price,
      imageUrl: data.imageUrl === undefined ? current.imageUrl : data.imageUrl,
      isAvailable: data.isAvailable,
      translations: { deleteMany: {}, create: cleanTranslations(data.translations, restaurant) },
    },
    include: { translations: true },
  });

  if (current.imageUrl && current.imageUrl !== product.imageUrl) await deleteUpload(current.imageUrl);
  res.json(serializeProduct(product));
});

productsRouter.delete("/:id", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const product = await findOwnedProduct(req.params.id, restaurantId);
  await prisma.product.delete({ where: { id: product.id } });
  await deleteUpload(product.imageUrl);
  res.status(204).end();
});
