const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

/** "Kebapçı Ali" -> "kebapci-ali" */
export function slugify(text: string) {
  return text
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşü]/g, (c) => TR_MAP[c])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Elle yazılan link için: geçersiz karakterleri atar ama yazarken tireye izin verir. */
export function sanitizeSlugInput(text: string) {
  return text
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşü]/g, (c) => TR_MAP[c])
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);
}
