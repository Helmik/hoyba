"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { Business } from "@/types/host";
import type { SupportedLocale } from "@/types/i18n";
import EventFlyerUpload from "./EventFlyerUpload";
import EventLivePreview from "./EventLivePreview";
import EventFormFields from "./EventFormFields";
import { useNewEventForm } from "./useNewEventForm";

interface NewEventFormProps {
  readonly businesses: Business[];
  readonly initialBusinessId?: string;
  readonly locale: SupportedLocale;
}

export default function NewEventForm({
  businesses,
  initialBusinessId,
  locale,
}: NewEventFormProps) {
  const {
    businessId, title, description, category, coverImageUrl, startTime, endTime,
    priceRange, customWhatsappMsg, serverError, isSubmitting, errors,
    previewEvent, handleBusinessChange, setTitle, setDescription, setCategory,
    setCoverImageUrl, setStartTime, setEndTime, setPriceRange,
    setCustomWhatsappMsg, handleSubmit,
  } = useNewEventForm(businesses, initialBusinessId, locale);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <form noValidate onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm sm:p-8">
          {serverError && (
            <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {serverError}
            </div>
          )}

          <EventFlyerUpload
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            error={errors.cover_image_url}
          />

          <EventFormFields
            businesses={businesses}
            businessId={businessId}
            title={title}
            description={description}
            category={category}
            startTime={startTime}
            endTime={endTime}
            priceRange={priceRange}
            customWhatsappMsg={customWhatsappMsg}
            errors={errors}
            onBusinessChange={handleBusinessChange}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onCategoryChange={setCategory}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onPriceRangeChange={setPriceRange}
            onCustomWhatsappMsgChange={setCustomWhatsappMsg}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ WebkitTapHighlightColor: "transparent" }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 stroke-[2.5]" />}
            <span>{isSubmitting ? "Publicando en Vivo..." : "Publicar Experiencia en Vivo"}</span>
          </button>
        </form>
      </div>

      <div className="hidden lg:col-span-5 lg:block">
        <EventLivePreview event={previewEvent} locale={locale} />
      </div>
    </div>
  );
}
