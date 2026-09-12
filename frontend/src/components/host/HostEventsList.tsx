"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Business, HostEvent } from "@/types/host";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";
import { MAX_ACTIVE_EVENTS_PER_BUSINESS } from "@/constants/config";
import HostEventCard from "./HostEventCard";
import BusinessFilterChips from "./BusinessFilterChips";

interface HostEventsListProps {
  readonly businesses: Business[];
  readonly initialEvents: HostEvent[];
  readonly initialBusinessId?: string;
  readonly locale: SupportedLocale;
}

export default function HostEventsList({
  businesses,
  initialEvents,
  initialBusinessId,
  locale,
}: HostEventsListProps) {
  const tHost = useTranslations("host");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(
    initialBusinessId || (businesses.length === 1 ? businesses[0].id : "all")
  );
  const [events, setEvents] = useState<HostEvent[]>(initialEvents);

  const filteredEvents =
    selectedBusinessId === "all"
      ? events
      : events.filter((e) => e.business_id === selectedBusinessId);

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
  const activeCount = filteredEvents.filter((e) => e.is_active).length;

  const handleStatusToggled = (eventId: string, newStatus: boolean) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, is_active: newStatus } : e)));
  };

  const handleDeleted = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">{tHost("posts")}</h1>
          <p className="text-xs text-slate-400">{tHost("postsSubtitle")}</p>
        </div>

        <Link
          href={`${ROUTES.HOST_POST_NEW(locale)}${
            selectedBusinessId !== "all" ? `?businessId=${selectedBusinessId}` : ""
          }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>{tHost("newPost")}</span>
        </Link>
      </div>

      <BusinessFilterChips
        businesses={businesses}
        totalEventsCount={events.length}
        selectedBusinessId={selectedBusinessId}
        onSelect={setSelectedBusinessId}
        allLabel={tHost("all")}
      />

      {selectedBusiness && (
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-xs text-slate-400">
          <span>{selectedBusiness.name}</span>
          <span className="font-semibold text-amber-400">
            {tHost("activeLimitBadge", { count: activeCount })} ({tHost("activeLimit")})
          </span>
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center sm:p-12">
          <Sparkles className="mx-auto h-8 w-8 text-amber-400/50" />
          <p className="mt-3 text-sm text-slate-400">{tHost("newPostSubtitle")}</p>
          <Link
            href={`${ROUTES.HOST_POST_NEW(locale)}${
              selectedBusinessId !== "all" ? `?businessId=${selectedBusinessId}` : ""
            }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{tHost("newPost")}</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <HostEventCard
              key={event.id}
              event={event}
              onStatusToggled={handleStatusToggled}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
