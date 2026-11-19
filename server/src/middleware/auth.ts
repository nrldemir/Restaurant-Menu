import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { HttpError } from "../lib/http";

export interface AuthPayload {
  userId: string;
  restaurantId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Giriş yapmanız gerekiyor");

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.auth = { userId: decoded.userId, restaurantId: decoded.restaurantId };
  } catch {
    throw new HttpError(401, "Oturumunuz geçersiz veya süresi dolmuş");
  }
  next();
};

export function getAuth(req: Request): AuthPayload {
  if (!req.auth) throw new HttpError(401, "Giriş yapmanız gerekiyor");
  return req.auth;
}
