import type { TranslationMap } from "./types";

export const LANGUAGES: Record<string, { name: string; flag: string; rtl?: boolean }> = {
  tr: { name: "Türkçe", flag: "🇹🇷" },
  en: { name: "English", flag: "🇬🇧" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  it: { name: "Italiano", flag: "🇮🇹" },
  ru: { name: "Русский", flag: "🇷🇺" },
  ar: { name: "العربية", flag: "🇸🇦", rtl: true },
};

export const CURRENCIES = ["TRY", "USD", "EUR", "GBP"];

/** Müşteri menüsündeki sabit metinler. */
const UI = {
  tr: { search: "Menüde ara", soldOut: "Tükendi", table: "Masa", noResults: "Sonuç bulunamadı", notFound: "Menü bulunamadı", language: "Dil" },
  en: { search: "Search the menu", soldOut: "Sold out", table: "Table", noResults: "No results", notFound: "Menu not found", language: "Language" },
  de: { search: "Menü durchsuchen", soldOut: "Ausverkauft", table: "Tisch", noResults: "Keine Ergebnisse", notFound: "Menü nicht gefunden", language: "Sprache" },
  fr: { search: "Rechercher", soldOut: "Épuisé", table: "Table", noResults: "Aucun résultat", notFound: "Menu introuvable", language: "Langue" },
  es: { search: "Buscar en el menú", soldOut: "Agotado", table: "Mesa", noResults: "Sin resultados", notFound: "Menú no encontrado", language: "Idioma" },
  it: { search: "Cerca nel menu", soldOut: "Esaurito", table: "Tavolo", noResults: "Nessun risultato", notFound: "Menu non trovato", language: "Lingua" },
  ru: { search: "Поиск по меню", soldOut: "Нет в наличии", table: "Стол", noResults: "Ничего не найдено", notFound: "Меню не найдено", language: "Язык" },
  ar: { search: "ابحث في القائمة", soldOut: "نفد", table: "طاولة", noResults: "لا توجد نتائج", notFound: "القائمة غير موجودة", language: "اللغة" },
} as const;

export function uiText(lang: string) {
  return UI[lang as keyof typeof UI] ?? UI.en;
}

/** İstenen dilde çeviri yoksa varsayılan dile, o da yoksa ilk bulunana düşer. */
export function pick(map: TranslationMap, lang: string, fallback: string) {
  return map[lang] ?? map[fallback] ?? Object.values(map)[0] ?? { name: "" };
}

export function formatPrice(price: number, currency: string, lang: string) {
  try {
    const whole = Number.isInteger(price);
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}
