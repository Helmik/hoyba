import type { SupportedLocale } from "@/types/i18n";

export const ROUTES = {
  HOME: (locale: SupportedLocale = "es") => `/${locale}`,
  EVENT_DETAIL: (locale: SupportedLocale, eventId: string) =>
    `/${locale}/events/${eventId}`,
  MAP_VIEW: (locale: SupportedLocale = "es") => `/${locale}/map`,
  SAVED: (locale: SupportedLocale = "es") => `/${locale}/saved`,
  LOGIN: (locale: SupportedLocale = "es") => `/${locale}/login`,
  SIGNUP: (locale: SupportedLocale = "es") => `/${locale}/signup`,
  FORGOT_PASSWORD: (locale: SupportedLocale = "es") => `/${locale}/forgot-password`,
  RESET_PASSWORD: (locale: SupportedLocale = "es") => `/${locale}/reset-password`,
  AUTH_CALLBACK: (locale: SupportedLocale = "es") => `/${locale}/callback`,
} as const;
