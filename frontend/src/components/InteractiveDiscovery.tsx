"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { Search, Map as MapIcon, List, Sparkles } from "lucide-react";
import CategoryFilter from "./CategoryFilter";
import EventCard, { type EventRow } from "./EventCard";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[65vh] min-h-[420px] w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-500 animate-pulse">
      <span className="text-sm font-medium">Loading interactive map...</span>
    </div>
  ),
});

interface InteractiveDiscoveryProps {
  initialEvents: EventRow[];
}

export default function InteractiveDiscovery({
  initialEvents,
}: InteractiveDiscoveryProps) {
  const t = useTranslations("common");
  const locale = useLocale();

  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // Category match
      if (activeCategory !== "all" && event.category !== activeCategory) {
        return false;
      }

      // Query match (fuzzy check over titles & descriptions)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const titles = event.title as Record<string, string> | null;
        const descriptions = event.description as Record<string, string> | null;

        const titleText = Object.values(titles || {}).join(" ").toLowerCase();
        const descText = Object.values(descriptions || {}).join(" ").toLowerCase();
        const locText = (event.location_name || "").toLowerCase();

        if (
          !titleText.includes(q) &&
          !descText.includes(q) &&
          !locText.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [initialEvents, activeCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & View Switcher */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full h-11 rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {/* View Switcher Button Group */}
        <div className="flex rounded-xl border border-slate-800 bg-slate-900/90 p-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>{t("listView")}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "map"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span>{t("mapView")}</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <CategoryFilter
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* View Content */}
      {viewMode === "map" ? (
        <MapView events={filteredEvents} />
      ) : (
        <>
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-12 text-center">
              <Sparkles className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">
                {t("noEventsFound")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
