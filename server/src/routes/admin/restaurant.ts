import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/http";
import { restaurantUpdateSchema } from "../../lib/schemas";
import { deleteUpload } from "../../lib/uploads";
import { getAuth } from "../../middleware/auth";
import { serializeRestaurant } from "../serializers";

export const restaurantRouter = Router();

restaurantRouter.get("/", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const restaurant = await prisma.restaurant.findUniqueOrThrow({ where: { id: restaurantId } });
  res.json(serializeRestaurant(restaurant));
});

restaurantRouter.put("/", async (req, res) => {
  const { restaurantId } = getAuth(req);
  const data = restaurantUpdateSchema.parse(req.body);

  const slugOwner = await prisma.restaurant.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (slugOwner && slugOwner.id !== restaurantId) {
    throw new HttpError(409, "Bu link adı başka bir restoran tarafından kullanılıyor");
  }

  const current = await prisma.restaurant.findUniqueOrThrow({ where: { id: restaurantId } });
  const updated = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      logoUrl: data.logoUrl === undefined ? current.logoUrl : data.logoUrl,
      coverUrl: data.coverUrl === undefined ? current.coverUrl : data.coverUrl,
      theme: data.theme ?? current.theme,
      currency: data.currency,
      languages: data.languages.join(","),
      defaultLanguage: data.defaultLanguage,
    },
  });

  if (current.logoUrl && current.logoUrl !== updated.logoUrl) await deleteUpload(current.logoUrl);
  if (current.coverUrl && current.coverUrl !== updated.coverUrl) await deleteUpload(current.coverUrl);
  res.json(serializeRestaurant(updated));
});
