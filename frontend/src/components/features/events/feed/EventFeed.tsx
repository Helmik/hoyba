"use client";

import React from "react";
import EventCard from "../card/EventCard";
import EventCardSkeleton from "../card/EventCardSkeleton";
import EventFeedEmpty from "./EventFeedEmpty";
import type { EventViewModel } from "@/types/events";
import type { SupportedLocale } from "@/types/i18n.types";

export interface EventFeedProps {
  readonly events: readonly EventViewModel[];
  readonly locale: SupportedLocale;
  readonly isLoading?: boolean;
  readonly onClearFilters?: () => void;
}

export default function EventFeed({
  events,
  locale,
  isLoading = false,
  onClearFilters,
}: EventFeedProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <EventFeedEmpty onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {events.map((event, index) => (
        <EventCard
          key={event.id}
          event={event}
          locale={locale}
          priorityImage={index === 0}
        />
      ))}
    </div>
  );
}
