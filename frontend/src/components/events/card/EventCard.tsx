"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Bookmark, Check } from "lucide-react";
import type { EventCardProps } from "@/types/events";
import { STORAGE_SAVED_EVENTS_KEY } from "@/constants/config";
import EventCardCover from "./EventCardCover";
import EventCardMeta from "./EventCardMeta";
import EventCardAction from "./EventCardAction";

export default function EventCard({
  event,
  locale,
  priorityImage = false,
}: EventCardProps) {
  const tEvents = useTranslations("events");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_EVENTS_KEY);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        setIsSaved(ids.includes(event.id));
      }
    } catch {
      // Graceful fallback
    }
  }, [event.id]);

  const toggleSave = () => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_EVENTS_KEY);
      let ids: string[] = raw ? JSON.parse(raw) : [];
      if (ids.includes(event.id)) {
        ids = ids.filter((id) => id !== event.id);
        setIsSaved(false);
      } else {
        ids.push(event.id);
        setIsSaved(true);
      }
      localStorage.setItem(STORAGE_SAVED_EVENTS_KEY, JSON.stringify(ids));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const displayTitle =
    event.title?.[locale] ||
    event.title?.[event.originalLang] ||
    event.title?.["es"] ||
    event.title?.["en"] ||
    tEvents("untitled");

  const displayDesc =
    event.description?.[locale] ||
    event.description?.[event.originalLang] ||
    event.description?.["es"] ||
    event.description?.["en"] ||
    "";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10">
      {/* 1. Cover Image Container with Badges */}
      <EventCardCover
        coverImageUrl={event.coverImageUrl}
        title={displayTitle}
        category={event.category}
        price={event.price}
        currency={event.currency}
        isFree={event.isFree}
        priority={priorityImage}
      />

      {/* Floating Bookmark Button */}
      <button
        type="button"
        onClick={toggleSave}
        aria-label={isSaved ? tEvents("saved") : tEvents("save")}
        className={`absolute right-3 top-3 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-[0.98] ${
          isSaved
            ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold"
            : "bg-slate-950/70 text-slate-300 hover:bg-slate-900 hover:text-white"
        }`}
      >
        {isSaved ? (
          <Check className="h-4 w-4 stroke-[3]" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </button>

      {/* 2. Content & Metadata */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <EventCardMeta
          startDate={event.startDate}
          locationName={event.locationName}
          locale={locale}
        />

        <h3 className="mb-2 text-base font-extrabold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
          {displayTitle}
        </h3>

        {displayDesc && (
          <p className="mb-4 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        )}

        {/* 3. Priority WhatsApp Action Button */}
        <EventCardAction
          eventTitle={displayTitle}
          whatsappPhone={event.whatsappPhone}
        />
      </div>
    </article>
  );
}
