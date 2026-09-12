"use client";

import type { SupportedLocale } from "@/types/i18n";
import type { EventViewModel } from "@/types/events";
import EventCard from "@/components/events/card/EventCard";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";

interface EventLivePreviewProps {
  readonly event: EventViewModel;
  readonly locale: SupportedLocale;
}

export default function EventLivePreview({ event, locale }: EventLivePreviewProps) {
  const tHost = useTranslations("host");

  return (
    <aside className="sticky top-24 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
        <Eye className="h-4 w-4" />
        <span>{tHost("livePreview")}</span>
      </div>
      <div className="max-w-sm">
        <EventCard event={event} locale={locale} priorityImage />
      </div>
      <p className="text-[11px] text-slate-500">
        {tHost("newPostSubtitle")}
      </p>
    </aside>
  );
}
