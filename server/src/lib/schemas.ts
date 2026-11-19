import { z } from "zod";
import { SUPPORTED_LANGUAGES } from "./languages";

const langCode = z.enum(SUPPORTED_LANGUAGES);
const slug = z
  .string()
  .trim()
  .min(3, "Link adı en az 3 karakter olmalı")
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Link adı sadece küçük harf, rakam ve tire içerebilir");
const email = z.string().trim().toLowerCase().email("Geçerli bir e-posta girin");
const uploadUrl = z.string().regex(/^\/uploads\/[\w.-]+$/, "Geçersiz görsel adresi");

export const registerSchema = z.object({
  email,
  password: z.string().min(8, "Şifre en az 8 karakter olmalı").max(200),
  restaurantName: z.string().trim().min(2, "Restoran adı en az 2 karakter olmalı").max(100),
  slug,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Şifre gerekli"),
});

export const restaurantUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    slug,
    description: z.string().trim().max(500).nullable().optional(),
    logoUrl: uploadUrl.nullable().optional(),
    currency: z.string().trim().toUpperCase().length(3),
    languages: z.array(langCode).min(1, "En az bir dil seçin"),
    defaultLanguage: langCode,
  })
  .refine((d) => d.languages.includes(d.defaultLanguage), {
    message: "Varsayılan dil, seçili diller arasında olmalı",
    path: ["defaultLanguage"],
  });

const translations = z.record(
  z.string(),
  z.object({
    name: z.string().max(150),
    description: z.string().max(1000).optional(),
  }),
);

export const categorySchema = z.object({
  translations,
  isActive: z.boolean().optional(),
});

export const productSchema = z.object({
  categoryId: z.string().min(1),
  price: z.number().nonnegative().max(1_000_000),
  imageUrl: uploadUrl.nullable().optional(),
  isAvailable: z.boolean().optional(),
  translations,
});

export const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});
