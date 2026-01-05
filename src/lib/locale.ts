// Locale configuration - shared between client and server
export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "it";

/**
 * Sets the locale cookie for immediate language change
 */
export function setLocaleCookie(locale: Locale): void {
  document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

/**
 * Gets the locale from cookie (client-side)
 */
export function getLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
  const value = match?.[1];

  if (value && locales.includes(value as Locale)) {
    return value as Locale;
  }

  return null;
}

/**
 * Language labels for UI display
 */
export const languageLabels: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
};
