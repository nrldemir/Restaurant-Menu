export interface Translation {
  name: string;
  description?: string;
}
export type TranslationMap = Record<string, Translation>;

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  openingHours: string | null;
  theme: string;
  currency: string;
  languages: string[];
  defaultLanguage: string;
  menuUrl: string;
}

export interface Category {
  id: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
  translations: TranslationMap;
  productCount?: number;
}

export interface Product {
  id: string;
  categoryId: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  translations: TranslationMap;
}

export interface PublicMenu {
  restaurant: Omit<Restaurant, "id" | "menuUrl">;
  categories: (Category & { products: Product[] })[];
}

export interface Me {
  user: { id: string; email: string };
  restaurant: Restaurant;
}
