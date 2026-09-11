import type { SupportedLocale } from "./i18n";

export const EventCategory = {
  ALL: "all",
  WELLNESS: "wellness",
  MUSIC: "music",
  ART: "art",
  GASTRONOMY: "gastronomy",
} as const;

export type EventCategoryType =
  (typeof EventCategory)[keyof typeof EventCategory];

export interface EventViewModel {
  readonly id: string;
  readonly title: Record<string, string>;
  readonly description: Record<string, string>;
  readonly originalLang: string;
  readonly category: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly locationName: string;
  readonly address: string | null;
  readonly coordinates: { type: string; coordinates: [number, number] } | null;
  readonly coverImageUrl: string | null;
  readonly price: number;
  readonly currency: string;
  readonly isFree: boolean;
  readonly ticketUrl: string | null;
  readonly whatsappPhone?: string;
}

export interface EventCardProps {
  readonly event: EventViewModel;
  readonly locale: SupportedLocale;
  readonly priorityImage?: boolean;
}
