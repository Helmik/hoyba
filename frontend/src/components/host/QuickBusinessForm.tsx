"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { QuickBusinessSchema } from "@/lib/validations/business";
import type { Business, BusinessCategory, BusinessZone } from "@/types/host";
import { createBusiness } from "@/app/actions/host";
import { captureAppError } from "@/lib/error";
import type { SupportedLocale } from "@/types/i18n";
import QuickBusinessSuccess from "./QuickBusinessSuccess";
import QuickBusinessFields from "./QuickBusinessFields";

interface QuickBusinessFormProps {
  readonly locale: SupportedLocale;
}

export default function QuickBusinessForm({ locale }: QuickBusinessFormProps) {
  const [createdBusiness, setCreatedBusiness] = useState<Business | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [category, setCategory] = useState<BusinessCategory>("wellness");
  const [zone, setZone] = useState<BusinessZone>("La Veleta");
  const [whatsapp, setWhatsapp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const result = QuickBusinessSchema.safeParse({ name, category, zone, whatsapp_number: whatsapp });
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
      const res = await createBusiness(result.data);
      if (!res.success || !res.data) {
        setServerError(res.error || "No se pudo crear el negocio");
        return;
      }
      setCreatedBusiness(res.data);
    } catch (err) {
      captureAppError(err, { section: "host-quick-business" });
      setServerError("Error de conexión al crear el negocio");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdBusiness) return <QuickBusinessSuccess business={createdBusiness} locale={locale} />;

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:p-8">
      {serverError && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{serverError}</div>}

      <QuickBusinessFields
        name={name}
        category={category}
        zone={zone}
        whatsapp={whatsapp}
        errors={errors}
        onNameChange={setName}
        onCategoryChange={setCategory}
        onZoneChange={setZone}
        onWhatsappChange={setWhatsapp}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 stroke-[2.5]" />}
        <span>{isSubmitting ? "Registrando..." : "Crear Negocio"}</span>
      </button>
    </form>
  );
}
