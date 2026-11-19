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
  isActive: boolean;
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
  restaurant: Omit<Restaurant, "id" | "menuUrl" | "isActive">;
  categories: (Category & { products: Product[] })[];
}

export interface Me {
  user: { id: string; email: string; role: "owner" | "superadmin" };
  /** Süper adminin bağlı bir restoranı olmayabilir */
  restaurant: Restaurant | null;
  /** Süper admin bir restoranın paneline girmişse true */
  impersonating: boolean;
}

export interface SuperStats {
  restaurants: number;
  active: number;
  newThisWeek: number;
  categories: number;
  products: number;
  owners: number;
}

export interface SuperRestaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  theme: string;
  isActive: boolean;
  languages: string[];
  currency: string;
  owners: string[];
  categoryCount: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
  menuUrl: string;
}
