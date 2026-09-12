export const EventCategory = {
  ALL: "all",
  WELLNESS: "wellness",
  MUSIC: "music",
  ART: "art",
  GASTRONOMY: "gastronomy",
  PARTIES: "parties",
  CULTURE: "culture",
  COMMUNITY: "community",
} as const;

export type EventCategoryType = (typeof EventCategory)[keyof typeof EventCategory];

export const EVENT_CATEGORIES = [
  "wellness",
  "music",
  "art",
  "gastronomy",
  "parties",
  "culture",
  "community",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const BUSINESS_CATEGORIES = [
  "wellness",
  "music",
  "art",
  "gastronomy",
  "cenote",
  "beach_club",
  "restaurant",
  "hotel",
  "nightlife",
  "coworking",
  "other",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];
