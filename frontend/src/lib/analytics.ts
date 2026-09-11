import { track } from "@vercel/analytics";

/**
 * Type-safe custom telemetry events for Hoyba PWA using Vercel Analytics.
 * In accordance with PROJECT_SPEC.md, all telemetry is edge-dispatched
 * without touching PostgreSQL or Supabase database pools.
 */
export function trackEvent(name: string, properties?: Record<string, string | number | boolean | null>) {
  try {
    track(name, properties ?? {});
  } catch (error) {
    // Non-blocking telemetry failure
    console.debug("[Analytics] Failed to dispatch event:", name, error);
  }
}

export const analytics = {
  // Conversions
  whatsappClick: (params: {
    eventId: string;
    eventTitle: string;
    price: number;
    currency: string;
  }) => {
    trackEvent("whatsapp_conversion", params);
  },

  // Engagement & Discovery
  bookmarkToggle: (params: {
    eventId: string;
    category: string;
    isSaved: boolean;
  }) => {
    trackEvent("bookmark_toggle", params);
  },

  categoryFilter: (category: string) => {
    trackEvent("filter_category", { category });
  },

  zoneFilter: (zone: string) => {
    trackEvent("filter_zone", { zone });
  },

  searchQuery: (query: string) => {
    if (query.trim().length > 1) {
      trackEvent("search_query", { query: query.trim() });
    }
  },

  viewModeToggle: (mode: "list" | "map") => {
    trackEvent("view_mode_toggle", { mode });
  },

  languageChange: (params: { from: string; to: string }) => {
    trackEvent("language_switched", params);
  },

  navTabChange: (tab: string) => {
    trackEvent("nav_tab_change", { tab });
  },

  mapMarkerClick: (params: { eventId: string; category: string }) => {
    trackEvent("map_marker_click", params);
  },

  // Authentication events
  authSubmit: (params: {
    type: "login" | "signup" | "forgot_password" | "reset_password" | "signout";
    locale: string;
  }) => {
    trackEvent("auth_event", params);
  },
};
