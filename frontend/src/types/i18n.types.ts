export type SupportedLocale =
  | "es"
  | "en"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "nl"
  | "ru"
  | "uk"
  | "pl";

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  "es",
  "en",
  "fr",
  "de",
  "it",
  "pt",
  "nl",
  "ru",
  "uk",
  "pl",
] as const;

export const DEFAULT_LOCALE: SupportedLocale = "es";
