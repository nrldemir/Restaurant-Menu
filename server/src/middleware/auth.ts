import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { HttpError } from "../lib/http";
import { prisma } from "../lib/prisma";

export type Role = "owner" | "superadmin";

export interface AuthPayload {
  userId: string;
  restaurantId: string | null;
  role: Role;
  /** Süper admin bir restoranın paneline girdiyse, onun kullanıcı id'si */
  impersonatedBy?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload, expiresIn: "7d" | "2h" = "7d") {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Giriş yapmanız gerekiyor");

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as Partial<AuthPayload>;
    if (!decoded.userId) throw new Error("bad token");
    req.auth = {
      userId: decoded.userId,
      restaurantId: decoded.restaurantId ?? null,
      role: decoded.role === "superadmin" ? "superadmin" : "owner",
      impersonatedBy: decoded.impersonatedBy,
    };
  } catch {
    throw new HttpError(401, "Oturumunuz geçersiz veya süresi dolmuş");
  }
  next();
};

/** Oturum bilgisi (restoranı olmayan süper admin dahil). */
export function getSession(req: Request): AuthPayload {
  if (!req.auth) throw new HttpError(401, "Giriş yapmanız gerekiyor");
  return req.auth;
}

/** Restoran paneli istekleri için: oturumun bağlı olduğu restoran zorunlu. */
export function getAuth(req: Request): AuthPayload & { restaurantId: string } {
  const session = getSession(req);
  if (!session.restaurantId) throw new HttpError(403, "Bu işlem için bir restoran hesabı gerekiyor");
  return session as AuthPayload & { restaurantId: string };
}

/**
 * Süper admin rotaları: yetki her istekte veritabanından doğrulanır
 * (token'daki role güvenilmez; yetki geri alınırsa hemen etkili olur).
 */
export const requireSuperAdmin: RequestHandler = async (req, _res, next) => {
  const session = getSession(req);
  if (session.impersonatedBy) throw new HttpError(403, "Bu işlem için yetkiniz yok");
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (user?.role !== "superadmin") throw new HttpError(403, "Bu işlem için yetkiniz yok");
  next();
};
