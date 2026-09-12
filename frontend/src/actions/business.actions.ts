"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { QuickBusinessSchema, FullBusinessSchema } from "@/lib/validations/business";
import type { ActionResult, Business } from "@/types/host";
import { captureAppError } from "@/lib/error";

/**
 * Parses PostGIS coordinates from GeoJSON or WKT format to { lat, lng }
 */
function parseCoords(raw: unknown): { lat: number; lng: number } | null {
  if (!raw) return null;
  if (typeof raw === "object" && "coordinates" in (raw as Record<string, unknown>)) {
    const coords = (raw as { coordinates: number[] }).coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      return { lng: coords[0], lat: coords[1] };
    }
  }
  if (typeof raw === "string") {
    const match = raw.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (match) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
  }
  return null;
}


/**
 * Retrieves all businesses owned by the authenticated session user
 */
export async function getUserBusinesses(): Promise<ActionResult<Business[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado" };
    }

    const { data: businesses, error: dbError } = await (supabase as any)
      .from("businesses")
      .select(`
        *,
        events:events(count)
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      captureAppError(dbError, { section: "getUserBusinesses", user: { id: user.id } });
      return { success: false, error: dbError.message };
    }

    // Query active events count for each business
    const { data: activeEvents } = await (supabase as any)
      .from("events")
      .select("business_id")
      .eq("is_active", true);

    const activeCountMap: Record<string, number> = {};
    if (activeEvents) {
      for (const ev of activeEvents) {
        if (ev.business_id) {
          activeCountMap[ev.business_id] = (activeCountMap[ev.business_id] || 0) + 1;
        }
      }
    }

    const mapped: Business[] = (businesses || []).map((b: any) => ({
      id: b.id,
      owner_id: b.owner_id,
      name: b.name,
      category: b.category,
      zone: b.zone,
      whatsapp_number: b.whatsapp_number,
      instagram_handle: b.instagram_handle,
      cover_image_url: b.cover_image_url,
      bio: b.bio,
      address_details: b.address_details,
      coordinates: parseCoords(b.coordinates),
      opening_hours: b.opening_hours,
      is_verified: b.is_verified,
      created_at: b.created_at,
      active_events_count: activeCountMap[b.id] || 0,
    }));

    return { success: true, data: mapped };
  } catch (err: unknown) {
    captureAppError(err, { section: "getUserBusinesses" });
    return { success: false, error: "Error inesperado al cargar los negocios" };
  }
}

/**
 * Retrieves a single business by ID verifying ownership
 */
export async function getBusinessById(id: string): Promise<ActionResult<Business>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado" };
    }

    const { data: b, error: dbError } = await (supabase as any)
      .from("businesses")
      .select("*")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (dbError || !b) {
      return { success: false, error: "Negocio no encontrado o sin permisos" };
    }

    // Get active events count
    const { count } = await (supabase as any)
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("business_id", id)
      .eq("is_active", true);

    const business: Business = {
      id: b.id,
      owner_id: b.owner_id,
      name: b.name,
      category: b.category,
      zone: b.zone,
      whatsapp_number: b.whatsapp_number,
      instagram_handle: b.instagram_handle,
      cover_image_url: b.cover_image_url,
      bio: b.bio,
      address_details: b.address_details,
      coordinates: parseCoords(b.coordinates),
      opening_hours: b.opening_hours,
      is_verified: b.is_verified,
      created_at: b.created_at,
      active_events_count: count || 0,
    };

    return { success: true, data: business };
  } catch (err: unknown) {
    captureAppError(err, { section: "getBusinessById" });
    return { success: false, error: "Error al consultar el negocio" };
  }
}

/**
 * Creates a new business (quick onboarding)
 */
export async function createBusiness(data: unknown): Promise<ActionResult<Business>> {
  try {
    const parsed = QuickBusinessSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de negocio inválidos",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado" };
    }

    const { data: created, error: dbError } = await (supabase as any)
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: parsed.data.name,
        category: parsed.data.category,
        zone: parsed.data.zone,
        whatsapp_number: parsed.data.whatsapp_number,
        cover_image_url: parsed.data.cover_image_url || null,
        bio: {},
        opening_hours: {},
      })
      .select()
      .single();

    if (dbError) {
      captureAppError(dbError, { section: "createBusiness", user: { id: user.id } });
      return { success: false, error: dbError.message };
    }

    revalidatePath("/host/businesses");
    revalidatePath("/host/posts");

    const newBusiness: Business = {
      ...created,
      coordinates: parseCoords(created.coordinates),
      active_events_count: 0,
    };

    return { success: true, data: newBusiness };
  } catch (err: unknown) {
    captureAppError(err, { section: "createBusiness" });
    return { success: false, error: "Error al crear el negocio" };
  }
}

/**
 * Updates full/enriched profile of a business
 */
export async function updateBusiness(
  id: string,
  data: unknown
): Promise<ActionResult<Business>> {
  try {
    const parsed = FullBusinessSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos de perfil inválidos",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado" };
    }

    const updatePayload: Record<string, unknown> = {
      name: parsed.data.name,
      category: parsed.data.category,
      zone: parsed.data.zone,
      whatsapp_number: parsed.data.whatsapp_number,
      instagram_handle: parsed.data.instagram_handle || null,
      cover_image_url: parsed.data.cover_image_url || null,
      address_details: parsed.data.address_details || null,
    };

    if (parsed.data.bio_es) {
      updatePayload.bio = { es: parsed.data.bio_es };
    }

    if (parsed.data.coordinates) {
      updatePayload.coordinates = `POINT(${parsed.data.coordinates.lng} ${parsed.data.coordinates.lat})`;
    }

    const { data: updated, error: dbError } = await (supabase as any)
      .from("businesses")
      .update(updatePayload)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select()
      .single();

    if (dbError) {
      captureAppError(dbError, { section: "updateBusiness", user: { id: user.id } });
      return { success: false, error: dbError.message };
    }

    revalidatePath("/host/businesses");
    revalidatePath(`/host/businesses/${id}/edit`);

    return {
      success: true,
      data: {
        ...updated,
        coordinates: parseCoords(updated.coordinates),
      },
    };
  } catch (err: unknown) {
    captureAppError(err, { section: "updateBusiness" });
    return { success: false, error: "Error al actualizar el negocio" };
  }
}

/**
 * Retrieves events for host view, optionally filtered by businessId
 */
