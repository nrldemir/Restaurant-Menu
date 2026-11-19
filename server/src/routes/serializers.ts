import type { Category, CategoryTranslation, Product, ProductTranslation, Restaurant } from "@prisma/client";
import { config } from "../config";
import { parseLanguages } from "../lib/languages";
import { toTranslationMap } from "../lib/translations";

export function menuUrl(slug: string) {
  return new URL(`/menu/${slug}`, config.clientUrl).toString();
}

export function serializeRestaurant(r: Restaurant) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    logoUrl: r.logoUrl,
    coverUrl: r.coverUrl,
    phone: r.phone,
    openingHours: r.openingHours,
    theme: r.theme,
    currency: r.currency,
    languages: parseLanguages(r.languages),
    defaultLanguage: r.defaultLanguage,
    isActive: r.isActive,
    menuUrl: menuUrl(r.slug),
  };
}

export function serializeCategory(c: Category & { translations: CategoryTranslation[] }) {
  return {
    id: c.id,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    imageUrl: c.imageUrl,
    translations: toTranslationMap(c.translations),
  };
}

export function serializeProduct(p: Product & { translations: ProductTranslation[] }) {
  return {
    id: p.id,
    categoryId: p.categoryId,
    price: p.price,
    imageUrl: p.imageUrl,
    isAvailable: p.isAvailable,
    sortOrder: p.sortOrder,
    translations: toTranslationMap(p.translations),
  };
}
