"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import HomeNavbar from "@/components/home/HomeNavbar";
import HeroSearch from "@/components/home/HeroSearch";
import CategoryChips from "@/components/home/CategoryChips";
import EventFeed from "@/components/home/EventFeed";
import BottomNav, { type BottomNavTab } from "@/components/navigation/BottomNav";
import { useEventFilter } from "@/hooks/useEventFilter";
import type { EventViewModel } from "@/types/events";
import type { SupportedLocale } from "@/types/i18n";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60dvh] min-h-[380px] w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-400 animate-pulse">
      <span className="text-xs font-semibold">Cargando mapa...</span>
    </div>
  ),
});

interface HomeClientContainerProps {
  readonly initialEvents: EventViewModel[];
}

export default function HomeClientContainer({
  initialEvents,
}: HomeClientContainerProps) {
  const tHome = useTranslations("home");
  const locale = useLocale() as SupportedLocale;

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [activeTab, setActiveTab] = useState<BottomNavTab>("agenda");

  // Consume logic through isolated custom hook
  const {
    filteredEvents,
    searchQuery,
    setSearchQuery,
    activeZone,
    setActiveZone,
    activeChip,
    setActiveChip,
    savedCount,
    clearFilters,
  } = useEventFilter({
    initialEvents,
    onlySaved: activeTab === "saved",
  });

  const handleTabSelect = (tab: BottomNavTab) => {
    setActiveTab(tab);
    setViewMode(tab === "map" ? "map" : "list");
  };

  const handleToggleView = () => {
    const nextView = viewMode === "list" ? "map" : "list";
    setViewMode(nextView);
    setActiveTab(nextView === "map" ? "map" : "agenda");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-100 overflow-x-hidden pb-24 sm:pb-10">
      {/* 1. Fixed Sticky Navbar */}
      <HomeNavbar viewMode={viewMode} onToggleView={handleToggleView} />

      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-4 sm:px-6 space-y-4">
        {/* 2. Hero Search with Date & Zones */}
        <HeroSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeZone={activeZone}
          onZoneSelect={setActiveZone}
        />

        {/* 3. Thematic Category Chips */}
        <CategoryChips
          activeCategory={activeChip}
          onSelectCategory={setActiveChip}
        />

        {/* 4 & 5. Event Feed or Map View */}
        <div className="pt-1">
          {viewMode === "map" ? (
            <div className="space-y-4">
              <MapView events={filteredEvents as any} />
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleTabSelect("agenda")}
                  className="rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition-all active:scale-[0.98]"
                >
                  {tHome("returnToList", { count: filteredEvents.length })}
                </button>
              </div>
            </div>
          ) : (
            <EventFeed
              events={filteredEvents}
              locale={locale}
              onClearFilters={clearFilters}
            />
          )}
        </div>
      </main>

      {/* 6. Fixed Bottom Navigation for Mobile Thumb Zone */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        savedCount={savedCount}
      />
    </div>
  );
}
