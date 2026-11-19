import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http";
import { loginSchema, registerSchema } from "../lib/schemas";
import { getSession, requireAuth, signToken } from "../middleware/auth";
import { serializeRestaurant } from "./serializers";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);

  if (await prisma.user.findUnique({ where: { email: data.email } })) {
    throw new HttpError(409, "Bu e-posta ile kayıtlı bir hesap zaten var");
  }
  if (await prisma.restaurant.findUnique({ where: { slug: data.slug } })) {
    throw new HttpError(409, "Bu link adı başka bir restoran tarafından kullanılıyor");
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
      restaurant: { create: { name: data.restaurantName, slug: data.slug } },
    },
  });

  res.status(201).json({ token: signToken({ userId: user.id, restaurantId: user.restaurantId, role: "owner" }) });
});

authRouter.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new HttpError(401, "E-posta veya şifre hatalı");
  }

  const role = user.role === "superadmin" ? "superadmin" : "owner";
  res.json({ token: signToken({ userId: user.id, restaurantId: user.restaurantId, role }) });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const session = getSession(req);
  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { restaurant: true } });
  if (!user) throw new HttpError(401, "Kullanıcı bulunamadı");

  res.json({
    user: { id: user.id, email: user.email, role: user.role === "superadmin" ? "superadmin" : "owner" },
    restaurant: user.restaurant ? serializeRestaurant(user.restaurant) : null,
    impersonating: Boolean(session.impersonatedBy),
  });
});
