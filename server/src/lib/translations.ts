import { HttpError } from "./http";
import { parseLanguages } from "./languages";

export type TranslationInput = Record<string, { name: string; description?: string }>;

type TranslationRow = { lang: string; name: string; description: string | null };

/** DB satırlarını { tr: { name, description }, en: {...} } biçimine çevirir. */
export function toTranslationMap(rows: { lang: string; name: string; description: string | null }[]) {
  return Object.fromEntries(
    rows.map((t) => [t.lang, { name: t.name, description: t.description ?? "" }]),
  );
}

/**
 * Gelen çevirileri restoranın dillerine göre süzer.
 * Boş isimli diller atlanır; varsayılan dil için isim zorunludur.
 */
export function cleanTranslations(
  input: TranslationInput,
  restaurant: { languages: string; defaultLanguage: string },
): TranslationRow[] {
  const rows = parseLanguages(restaurant.languages)
    .filter((lang) => input[lang]?.name?.trim())
    .map((lang) => ({
      lang,
      name: input[lang].name.trim(),
      description: input[lang].description?.trim() || null,
    }));

  if (!rows.some((t) => t.lang === restaurant.defaultLanguage)) {
    throw new HttpError(400, `Varsayılan dil (${restaurant.defaultLanguage}) için isim zorunludur`);
  }
  return rows;
}
