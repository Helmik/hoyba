"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FullBusinessSchema } from "@/lib/validations/business";
import type { Business, BusinessCategory, BusinessZone } from "@/types/host";
import { updateBusiness } from "@/app/actions/host";
import { compressToWebP } from "@/lib/image-compression";
import { createClient } from "@/lib/supabase/client";
import { captureAppError } from "@/lib/error";
import { TULUM_DEFAULT_COORDS } from "@/constants/config";

export function useEditBusinessForm(business: Business) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "location">("general");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>(business.cover_image_url || "");
  const [coords, setCoords] = useState(business.coordinates || TULUM_DEFAULT_COORDS);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState<BusinessCategory>(business.category);
  const [zone, setZone] = useState<BusinessZone>(business.zone);
  const [whatsapp, setWhatsapp] = useState(business.whatsapp_number);
  const [instagram, setInstagram] = useState(business.instagram_handle || "");
  const [bioEs, setBioEs] = useState(business.bio?.["es"] || "");
  const [addressDetails, setAddressDetails] = useState(business.address_details || "");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const webpFile = await compressToWebP(file);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const fileName = `${user.id}/${Date.now()}_cover.webp`;
      const { error: uploadError } = await supabase.storage.from("covers").upload(fileName, webpFile, {
        upsert: true, contentType: "image/webp",
      });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(fileName);
      setCoverUrl(publicUrl);
    } catch (err) {
      captureAppError(err, { section: "host-edit-business-upload" });
      setFeedbackMsg({ type: "error", text: "Error al subir la imagen" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setErrors({});

    const result = FullBusinessSchema.safeParse({
      name, category, zone, whatsapp_number: whatsapp, instagram_handle: instagram,
      bio_es: bioEs, address_details: addressDetails, cover_image_url: coverUrl, coordinates: coords,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0]?.toString();
        if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setFeedbackMsg({ type: "error", text: "Por favor revisa los campos señalados" });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updateBusiness(business.id, result.data);
      if (!res.success) {
        setFeedbackMsg({ type: "error", text: res.error || "Error al guardar los cambios" });
        return;
      }
      setFeedbackMsg({ type: "success", text: "Cambios guardados con éxito" });
      router.refresh();
    } catch (err) {
      captureAppError(err, { section: "host-edit-business-submit" });
      setFeedbackMsg({ type: "error", text: "Error de conexión al guardar" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeTab, setActiveTab, isUploading, isSubmitting, coverUrl, coords, setCoords,
    feedbackMsg, errors, name, setName, category, setCategory, zone, setZone,
    whatsapp, setWhatsapp, instagram, setInstagram, bioEs, setBioEs,
    addressDetails, setAddressDetails, handleImageUpload, handleSubmit,
  };
}
