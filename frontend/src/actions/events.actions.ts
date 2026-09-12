"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { HostEventSchema } from "@/lib/validations/event";
import type { ActionResult, HostEvent } from "@/types/host";
import { captureAppError } from "@/lib/error";
import { MAX_ACTIVE_EVENTS_PER_BUSINESS } from "@/constants/config";

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


export async function getHostEvents(businessId?: string): Promise<ActionResult<HostEvent[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado" };
    }

    // Get all businesses for this user to ensure ownership filtering
    const { data: userBusinesses } = await (supabase as any)
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id);

    const businessIds: string[] = (userBusinesses || []).map((b: any) => b.id);
    if (businessIds.length === 0) {
      return { success: true, data: [] };
    }

    let query = (supabase as any)
      .from("events")
      .select("*")
      .in("business_id", businessIds)
      .order("start_time", { ascending: false });

    if (businessId && businessIds.includes(businessId)) {
      query = query.eq("business_id", businessId);
    }

    const { data: events, error: dbError } = await query;

    if (dbError) {
      captureAppError(dbError, { section: "getHostEvents", user: { id: user.id } });
      return { success: false, error: dbError.message };
    }

    const mapped: HostEvent[] = (events || []).map((ev: any) => ({
      id: ev.id,
      business_id: ev.business_id,
      category: ev.category,
      original_lang: ev.original_lang || "es",
      title: ev.title || {},
      description: ev.description || {},
      cover_image_url: ev.cover_image_url,
      start_time: ev.start_time || ev.start_date,
      end_time: ev.end_time || ev.end_date,
      price_range: ev.price_range,
      location_name: ev.location_name,
      coordinates: parseCoords(ev.coordinates) || { lat: 20.2114, lng: -87.4654 },
      custom_whatsapp_msg: ev.custom_whatsapp_msg,
      is_active: ev.is_active ?? ev.is_published ?? true,
      created_at: ev.created_at,
    }));

    return { success: true, data: mapped };
  } catch (err: unknown) {
    captureAppError(err, { section: "getHostEvents" });
    return { success: false, error: "Error al cargar las publicaciones" };
  }
}

/**
 * Creates a new event for a business, validating the 3 active events constraint
 */
export async function createEvent(data: unknown): Promise<ActionResult<HostEvent>> {
  try {
    const parsed = HostEventSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Datos del evento inválidos",
      };
    }

    const eventData = parsed.data;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado" };
    }

    // 1. Verify business belongs to authenticated user
    const { data: business, error: bError } = await (supabase as any)
      .from("businesses")
      .select("id, name, whatsapp_number")
      .eq("id", eventData.business_id)
      .eq("owner_id", user.id)
      .single();

    if (bError || !business) {
      return { success: false, error: "Negocio no válido o sin autorización" };
    }

    // 2. Check active events limit (Max 3 active per business)
    if (eventData.is_active) {
      const { count, error: countError } = await (supabase as any)
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("business_id", eventData.business_id)
        .eq("is_active", true);

      if (countError) {
        captureAppError(countError, { section: "createEvent:countActive" });
      }

      if ((count || 0) >= 3) {
        return {
          success: false,
          error: "Este negocio ya tiene el límite máximo de 3 publicaciones activas simultáneas.",
        };
      }
    }

    // 3. Multilingual title and description objects for DB JSONB check constraints
    const titleObj = {
      es: eventData.title,
      en: eventData.title,
    };
    const descObj = {
      es: eventData.description,
      en: eventData.description,
    };

    const pointWkt = `POINT(${eventData.coordinates.lng} ${eventData.coordinates.lat})`;

    const { data: created, error: dbError } = await (supabase as any)
      .from("events")
      .insert({
        business_id: eventData.business_id,
        organizer_id: user.id,
        category: eventData.category,
        original_lang: "es",
        title: titleObj,
        description: descObj,
        cover_image_url: eventData.cover_image_url,
        start_time: eventData.start_time,
        start_date: eventData.start_time,
        end_time: eventData.end_time || null,
        end_date: eventData.end_time || null,
        price_range: eventData.price_range || null,
        location_name: eventData.location_name,
        coordinates: pointWkt,
        custom_whatsapp_msg: eventData.custom_whatsapp_msg || null,
        is_active: eventData.is_active,
        is_published: eventData.is_active,
      })
      .select()
      .single();

    if (dbError) {
      captureAppError(dbError, { section: "createEvent:insert", user: { id: user.id } });
      return { success: false, error: dbError.message };
    }

    revalidatePath("/host/posts");
    revalidatePath("/host/businesses");
    revalidatePath("/");

    const mapped: HostEvent = {
      id: created.id,
      business_id: created.business_id,
      category: created.category,
      original_lang: created.original_lang,
      title: created.title,
      description: created.description,
      cover_image_url: created.cover_image_url,
      start_time: created.start_time || created.start_date,
      end_time: created.end_time || created.end_date,
      price_range: created.price_range,
      location_name: created.location_name,
      coordinates: parseCoords(created.coordinates) || eventData.coordinates,
      custom_whatsapp_msg: created.custom_whatsapp_msg,
      is_active: created.is_active,
      created_at: created.created_at,
    };

    return { success: true, data: mapped };
  } catch (err: unknown) {
    captureAppError(err, { section: "createEvent" });
    return { success: false, error: "Error al crear la publicación" };
  }
}

/**
 * Toggles an event between active and paused, verifying the 3 active limit
 */
export async function toggleEventStatus(
  eventId: string,
  isActive: boolean
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado" };
    }

    // 1. Get event and verify ownership via business
    const { data: event, error: evError } = await (supabase as any)
      .from("events")
      .select("id, business_id, is_active")
      .eq("id", eventId)
      .single();

    if (evError || !event) {
      return { success: false, error: "Evento no encontrado" };
    }

    const { data: business } = await (supabase as any)
      .from("businesses")
      .select("id")
      .eq("id", event.business_id)
      .eq("owner_id", user.id)
      .single();

    if (!business) {
      return { success: false, error: "No tienes permiso para modificar este evento" };
    }

    // 2. If activating, enforce max 3 active events constraint
    if (isActive) {
      const { count } = await (supabase as any)
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("business_id", event.business_id)
        .eq("is_active", true);

      if ((count || 0) >= 3) {
        return {
          success: false,
          error: "No se puede activar: el negocio ya tiene 3 eventos activos simultáneos.",
        };
      }
    }

    // 3. Update status
    const { error: updateError } = await (supabase as any)
      .from("events")
      .update({
        is_active: isActive,
        is_published: isActive,
      })
      .eq("id", eventId);

    if (updateError) {
      captureAppError(updateError, { section: "toggleEventStatus", user: { id: user.id } });
      return { success: false, error: updateError.message };
    }

    revalidatePath("/host/posts");
    revalidatePath("/host/businesses");
    revalidatePath("/");

    return { success: true, data: { isActive } };
  } catch (err: unknown) {
    captureAppError(err, { section: "toggleEventStatus" });
    return { success: false, error: "Error al actualizar estado del evento" };
  }
}

/**
 * Deletes an event after verifying ownership
 */
export async function deleteEvent(eventId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "No autenticado" };
    }

    const { data: event } = await (supabase as any)
      .from("events")
      .select("id, business_id")
      .eq("id", eventId)
      .single();

    if (!event) {
      return { success: false, error: "Evento no encontrado" };
    }

    const { data: business } = await (supabase as any)
      .from("businesses")
      .select("id")
      .eq("id", event.business_id)
      .eq("owner_id", user.id)
      .single();

    if (!business) {
      return { success: false, error: "Sin autorización para eliminar este evento" };
    }

    const { error: delError } = await (supabase as any)
      .from("events")
      .delete()
      .eq("id", eventId);

    if (delError) {
      return { success: false, error: delError.message };
    }

    revalidatePath("/host/posts");
    revalidatePath("/host/businesses");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    captureAppError(err, { section: "deleteEvent" });
    return { success: false, error: "Error al eliminar la publicación" };
  }
}
