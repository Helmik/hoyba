"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Clock, MapPin, Bookmark, Check, Ticket } from "lucide-react";
import type { Database } from "@/types/database.types";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];

interface EventCardProps {
  event: EventRow;
  onOpenLocation?: (lat: number, lng: number) => void;
}

export default function EventCard({ event, onOpenLocation }: EventCardProps) {
  const t = useTranslations("common");
  const tCat = useTranslations("categories");
  const locale = useLocale();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hoyba_saved_events");
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        setIsSaved(ids.includes(event.id));
      }
    } catch {
      // LocalStorage fallback
    }
  }, [event.id]);

  const toggleSave = () => {
    try {
      const raw = localStorage.getItem("hoyba_saved_events");
      let ids: string[] = raw ? JSON.parse(raw) : [];
      if (ids.includes(event.id)) {
        ids = ids.filter((id) => id !== event.id);
        setIsSaved(false);
      } else {
        ids.push(event.id);
        setIsSaved(true);
      }
      localStorage.setItem("hoyba_saved_events", JSON.stringify(ids));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  // Safe multilingual text resolution
  const titles = event.title as Record<string, string> | null;
  const descriptions = event.description as Record<string, string> | null;
  const displayTitle =
    titles?.[locale] ||
    titles?.[event.original_lang] ||
    titles?.["en"] ||
    titles?.["es"] ||
    "Untitled Event";

  const displayDesc =
    descriptions?.[locale] ||
    descriptions?.[event.original_lang] ||
    descriptions?.["en"] ||
    descriptions?.["es"] ||
    "";

  // Format start time
  const startDate = new Date(event.start_date);
  const timeString = startDate.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10">
      {/* Cover Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-700">
            <MapPin className="h-10 w-10 stroke-[1.5]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-lg bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-amber-400 backdrop-blur-md border border-slate-800">
            {tCat(event.category as any)}
          </span>
        </div>

        {/* Save Bookmark Button */}
        <button
          type="button"
          onClick={toggleSave}
          aria-label={isSaved ? t("saved") : t("saveToMyDay")}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
              : "bg-slate-950/70 text-slate-300 hover:bg-slate-900 hover:text-white"
          }`}
        >
          {isSaved ? (
            <Check className="h-4 w-4 stroke-[3]" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          {event.is_free ? (
            <span className="inline-flex items-center rounded-md bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-sm backdrop-blur-sm">
              {t("free")}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-slate-900/90 px-2.5 py-1 text-xs font-bold text-slate-100 border border-slate-700/80 backdrop-blur-sm">
              ${event.price} {event.currency}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{timeString}</span>
        </div>

        <h3 className="mb-2 text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
          {displayTitle}
        </h3>

        <p className="mb-4 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>

        {/* Footer info */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{event.location_name}</span>
          </div>

          {event.ticket_url && (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>Tickets</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
