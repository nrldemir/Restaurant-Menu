export const SUPPORTED_LANGUAGES = ["tr", "en", "de", "fr", "es", "it", "ru", "ar"] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export function parseLanguages(value: string): string[] {
  return value
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
}
