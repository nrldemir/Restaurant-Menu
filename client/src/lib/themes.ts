import type { CSSProperties } from "react";

export interface MenuTheme {
  name: string;
  /** Açık zemin üzerinde ana renk */
  primary: string;
  /** Koyu zemin üzerinde ana renk (daha açık ton) */
  primaryDark: string;
  accent: string;
  /** Kapak görseli yokken üst bölüm */
  hero: string;
}

export const THEMES: Record<string, MenuTheme> = {
  nar: {
    name: "Nar",
    primary: "#C2361A",
    primaryDark: "#FF8A66",
    accent: "#F2A93B",
    hero: "linear-gradient(135deg, #5E1607 0%, #A82A12 45%, #E2643A 100%)",
  },
  safran: {
    name: "Safran",
    primary: "#A85F00",
    primaryDark: "#F7BE4F",
    accent: "#D9480F",
    hero: "linear-gradient(135deg, #4A2700 0%, #9A5800 45%, #F0AE35 100%)",
  },
  zeytin: {
    name: "Zeytin",
    primary: "#4A7536",
    primaryDark: "#A3CC7A",
    accent: "#C9A227",
    hero: "linear-gradient(135deg, #172C12 0%, #3E6630 50%, #8DB35E 100%)",
  },
  ege: {
    name: "Ege",
    primary: "#17658A",
    primaryDark: "#6CC6E6",
    accent: "#F08A4B",
    hero: "linear-gradient(135deg, #07243A 0%, #155C80 50%, #3BA3C4 100%)",
  },
  murdum: {
    name: "Mürdüm",
    primary: "#7E2C5F",
    primaryDark: "#E39BC6",
    accent: "#E7B05A",
    hero: "linear-gradient(135deg, #2C0A21 0%, #6F2553 50%, #B4588B 100%)",
  },
  antrasit: {
    name: "Antrasit",
    primary: "#2F2924",
    primaryDark: "#E2C48A",
    accent: "#B8913F",
    hero: "linear-gradient(135deg, #0D0B09 0%, #2B2520 55%, #5C4F43 100%)",
  },
};

export function getTheme(id: string | undefined) {
  return THEMES[id ?? ""] ?? THEMES.nar;
}

/** Menü sayfasına uygulanan CSS değişkenleri. */
export function themeVars(id: string | undefined): CSSProperties {
  const t = getTheme(id);
  return {
    "--m-primary-light": t.primary,
    "--m-primary-dark": t.primaryDark,
    "--m-accent": t.accent,
    "--m-hero": t.hero,
  } as CSSProperties;
}
