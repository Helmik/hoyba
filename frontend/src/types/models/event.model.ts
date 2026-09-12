import type { Database } from "../database.types";
import type { EventCategory } from "../enums/categories.enum";
import type { TulumZone } from "../enums/zones.enum";
import type { SupportedLocale } from "../i18n.types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  category: EventCategory;
  zone: TulumZone;
  location_name?: string | null;
  start_time: string;
  end_time?: string | null;
  flyer_url?: string | null;
  instagram_url?: string | null;
  whatsapp_phone?: string | null;
  is_free?: boolean;
  price_amount?: number | null;
  currency?: string;
  business_id?: string | null;
  is_active?: boolean;
  created_at?: string;
}

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
