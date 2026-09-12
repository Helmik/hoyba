import type { GeoCoordinates } from "./models/business.model";

export * from "./models/business.model";
export * from "./models/event.model";
export * from "./enums/categories.enum";
export * from "./enums/zones.enum";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HostEvent {
  id: string;
  business_id: string;
  category: string;
  original_lang: string;
  title: Record<string, string>;
  description: Record<string, string>;
  cover_image_url: string;
  start_time: string;
  end_time?: string | null;
  price_range?: string | null;
  location_name: string;
  coordinates: GeoCoordinates;
  custom_whatsapp_msg?: string | null;
  is_active: boolean;
  created_at: string;
}
