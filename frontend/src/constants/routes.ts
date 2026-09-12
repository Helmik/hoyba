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
  RESET_PASSWORD: (locale: SupportedLocale = "es") => `/${locale}/recuperar-contrasena`,
  RECOVER_PASSWORD: (locale: SupportedLocale = "es") => `/${locale}/recuperar-contrasena`,
  AUTH_CALLBACK: (locale: SupportedLocale = "es") => `/${locale}/callback`,
  HOST_BUSINESSES: (locale: SupportedLocale = "es") => `/${locale}/host/businesses`,
  HOST_BUSINESS_NEW: (locale: SupportedLocale = "es") => `/${locale}/host/businesses/new`,
  HOST_BUSINESS_EDIT: (locale: SupportedLocale = "es", id: string) => `/${locale}/host/businesses/${id}/edit`,
  HOST_POSTS: (locale: SupportedLocale = "es") => `/${locale}/host/posts`,
  HOST_POST_NEW: (locale: SupportedLocale = "es") => `/${locale}/host/posts/new`,
} as const;
