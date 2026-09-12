import type { BusinessCategory } from "../enums/categories.enum";
import type { BusinessZone } from "../enums/zones.enum";

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
  description?: string | null;
  bio?: Record<string, string> | null;
  bio_es?: string | null;
  address_details?: string | null;
  coordinates?: GeoCoordinates | null;
  opening_hours?: Record<string, string> | null;
  is_verified: boolean;
  active_events_count?: number;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  updated_at?: string;
}

export type BusinessRow = Business;
export type BusinessInsert = Omit<Business, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};
export type BusinessUpdate = Partial<BusinessInsert>;
