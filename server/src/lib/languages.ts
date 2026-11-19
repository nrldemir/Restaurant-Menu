export const SUPPORTED_LANGUAGES = ["tr", "en", "de", "fr", "es", "it", "ru", "ar"] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const THEMES = ["bordo", "lacivert", "nar", "safran", "zeytin", "ege", "murdum", "antrasit"] as const;

export function parseLanguages(value: string): string[] {
  return value
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
}
