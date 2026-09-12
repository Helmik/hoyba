"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HostEventSchema } from "@/lib/validations/event";
import { createEvent } from "@/app/actions/host";
import { captureAppError } from "@/lib/error";
import type { Business } from "@/types/host";
import type { SupportedLocale } from "@/types/i18n";
import type { EventViewModel } from "@/types/events";
import { ROUTES } from "@/constants/routes";
import { TULUM_DEFAULT_COORDS } from "@/constants/config";

export function useNewEventForm(
  businesses: Business[],
  initialBusinessId: string | undefined,
  locale: SupportedLocale
) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const defaultBusinessId =
    initialBusinessId && businesses.some((b) => b.id === initialBusinessId)
      ? initialBusinessId
      : businesses[0]?.id || "";

  const [businessId, setBusinessId] = useState(defaultBusinessId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("wellness");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(TULUM_DEFAULT_COORDS);
  const [customWhatsappMsg, setCustomWhatsappMsg] = useState("");

  const selectedBusiness = businesses.find((b) => b.id === businessId);

  const handleBusinessChange = (newBusId: string) => {
    setBusinessId(newBusId);
    const bus = businesses.find((b) => b.id === newBusId);
    if (bus) {
      if (!locationName && bus.name) setLocationName(bus.name);
      if (bus.coordinates) setCoords(bus.coordinates);
    }
  };

  const previewEvent: EventViewModel = useMemo(() => ({
    id: "preview-temp-id",
    title: { [locale]: title || "Título del Evento" },
    description: { [locale]: description || "Descripción de la experiencia..." },
    originalLang: locale,
    category: category || "wellness",
    startDate: startTime || new Date().toISOString(),
    endDate: endTime || null,
    locationName: locationName || selectedBusiness?.name || "Tulum, Quintana Roo",
    address: selectedBusiness?.address_details || null,
    coordinates: coords ? { type: "Point", coordinates: [coords.lng, coords.lat] } : null,
    coverImageUrl: coverImageUrl || null,
    price: 0,
    currency: "MXN",
    isFree: !priceRange || priceRange.toLowerCase().includes("gratis"),
    ticketUrl: null,
    whatsappPhone: selectedBusiness?.whatsapp_number,
  }), [title, description, category, startTime, endTime, locationName, selectedBusiness, coords, coverImageUrl, priceRange, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const result = HostEventSchema.safeParse({
      business_id: businessId, title_es: title, description_es: description,
      category, cover_image_url: coverImageUrl, start_time: startTime,
      end_time: endTime || undefined, price_range: priceRange || undefined,
      location_name: locationName || selectedBusiness?.name || undefined,
      coordinates: coords || undefined, custom_whatsapp_msg: customWhatsappMsg || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0]?.toString();
        if (fieldName && !fieldErrors[fieldName]) fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createEvent(result.data);
      if (!res.success) {
        setServerError(res.error || "No se pudo crear la publicación");
        return;
      }
      router.push(ROUTES.HOST_POSTS(locale));
      router.refresh();
    } catch (err) {
      captureAppError(err, { section: "host-create-event" });
      setServerError("Error de conexión al crear el evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    businessId, title, description, category, coverImageUrl, startTime, endTime,
    priceRange, locationName, customWhatsappMsg, serverError, isSubmitting, errors,
    previewEvent, selectedBusiness, handleBusinessChange, setTitle, setDescription,
    setCategory, setCoverImageUrl, setStartTime, setEndTime, setPriceRange,
    setLocationName, setCustomWhatsappMsg, handleSubmit,
  };
}
