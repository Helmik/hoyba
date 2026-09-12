export const BUSINESS_CATEGORIES = [
  "wellness",
  "music",
  "art",
  "gastronomy",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const BUSINESS_ZONES = [
  "La Veleta",
  "Aldea Zama",
  "Centro",
  "Zona Costera",
  "Region 15",
] as const;

export type BusinessZone = (typeof BUSINESS_ZONES)[number];

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  category: BusinessCategory;
  zone: BusinessZone;
  whatsapp_number: string;
  instagram_handle?: string | null;
  cover_image_url?: string | null;
  bio?: Record<string, string> | null;
  address_details?: string | null;
  coordinates?: GeoCoordinates | null;
  opening_hours?: Record<string, string> | null;
  is_verified: boolean;
  created_at: string;
  active_events_count?: number;
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

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
