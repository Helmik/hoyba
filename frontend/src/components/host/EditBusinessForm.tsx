"use client";

import { Loader2, Check } from "lucide-react";
import type { Business } from "@/types/host";
import type { SupportedLocale } from "@/types/i18n";
import { useEditBusinessForm } from "./useEditBusinessForm";
import EditBusinessGeneralTab from "./EditBusinessGeneralTab";
import EditBusinessLocationTab from "./EditBusinessLocationTab";

interface EditBusinessFormProps {
  readonly business: Business;
  readonly locale: SupportedLocale;
}

export default function EditBusinessForm({ business, locale }: EditBusinessFormProps) {
  const {
    activeTab, setActiveTab, isUploading, isSubmitting, coverUrl, coords, setCoords,
    feedbackMsg, errors, name, setName, category, setCategory, zone, setZone,
    whatsapp, setWhatsapp, instagram, setInstagram, bioEs, setBioEs,
    addressDetails, setAddressDetails, handleImageUpload, handleSubmit,
  } = useEditBusinessForm(business);

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:p-8">
      <div className="flex border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className={`min-h-[44px] flex-1 pb-3 text-center text-xs font-bold transition-colors ${activeTab === "general" ? "border-b-2 border-amber-500 text-amber-400" : "text-slate-400 hover:text-white"}`}
        >
          Datos Generales
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("location")}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className={`min-h-[44px] flex-1 pb-3 text-center text-xs font-bold transition-colors ${activeTab === "location" ? "border-b-2 border-amber-500 text-amber-400" : "text-slate-400 hover:text-white"}`}
        >
          Ubicación & Mapa
        </button>
      </div>

      {feedbackMsg && (
        <div role="alert" className={`rounded-xl border p-3 text-xs ${feedbackMsg.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
          {feedbackMsg.text}
        </div>
      )}

      {activeTab === "general" ? (
        <EditBusinessGeneralTab
          name={name} category={category} zone={zone} whatsapp={whatsapp} instagram={instagram} bioEs={bioEs}
          coverUrl={coverUrl} isUploading={isUploading} errors={errors} onNameChange={setName}
          onCategoryChange={setCategory} onZoneChange={setZone} onWhatsappChange={setWhatsapp}
          onInstagramChange={setInstagram} onBioEsChange={setBioEs} onImageUpload={handleImageUpload}
        />
      ) : (
        <EditBusinessLocationTab
          addressDetails={addressDetails} coords={coords}
          onAddressDetailsChange={setAddressDetails} onCoordsChange={setCoords}
        />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 stroke-[3]" />}
        <span>{isSubmitting ? "Guardando..." : "Guardar Cambios"}</span>
      </button>
    </form>
  );
}
