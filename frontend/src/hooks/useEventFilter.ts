"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { EventViewModel, EventCategoryType } from "@/types/events";
import { TulumZone, type TulumZoneType } from "@/types/zones";
import { STORAGE_SAVED_EVENTS_KEY } from "@/constants/config";

interface UseEventFilterOptions {
  initialEvents: EventViewModel[];
  onlySaved?: boolean;
}

export function useEventFilter({
  initialEvents,
  onlySaved = false,
}: UseEventFilterOptions) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeZone, setActiveZone] = useState<TulumZoneType>(TulumZone.ALL);
  const [activeChip, setActiveChip] = useState<EventCategoryType>("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_EVENTS_KEY);
      if (raw) {
        setSavedIds(JSON.parse(raw));
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveZone(TulumZone.ALL);
    setActiveChip("all");
  }, []);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // Saved tab filter
      if (onlySaved && !savedIds.includes(event.id)) {
        return false;
      }

      // Zone filter (text matching on locationName & address)
      if (activeZone !== TulumZone.ALL) {
        const fullLocation = `${event.locationName || ""} ${event.address || ""}`.toLowerCase();
        if (activeZone === TulumZone.LA_VELETA && !fullLocation.includes("veleta")) {
          return false;
        }
        if (
          activeZone === TulumZone.ALDEA_ZAMA &&
          !fullLocation.includes("zamá") &&
          !fullLocation.includes("zama")
        ) {
          return false;
        }
        if (
          activeZone === TulumZone.CENTRO &&
          !fullLocation.includes("centro") &&
          !fullLocation.includes("downtown")
        ) {
          return false;
        }
        if (
          activeZone === TulumZone.ZONA_COSTERA &&
          !fullLocation.includes("costera") &&
          !fullLocation.includes("playa") &&
          !fullLocation.includes("beach") &&
          !fullLocation.includes("boca paila")
        ) {
          return false;
        }
      }

      // Thematic Chip filter
      if (activeChip !== "all") {
        if (activeChip === "wellness" && event.category !== "wellness") {
          return false;
        }
        if (
          activeChip === "music" &&
          event.category !== "live_music" &&
          event.category !== "nightlife"
        ) {
          return false;
        }
        if (
          activeChip === "art" &&
          event.category !== "workshop" &&
          event.category !== "art_culture"
        ) {
          return false;
        }
        if (activeChip === "gastronomy" && event.category !== "gastronomy") {
          return false;
        }
      }

      // Free-text query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const titles = Object.values(event.title || {}).join(" ").toLowerCase();
        const descs = Object.values(event.description || {}).join(" ").toLowerCase();
        const loc = (event.locationName || "").toLowerCase();

        if (!titles.includes(q) && !descs.includes(q) && !loc.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [initialEvents, onlySaved, savedIds, activeZone, activeChip, searchQuery]);

  return {
    filteredEvents,
    searchQuery,
    setSearchQuery,
    activeZone,
    setActiveZone,
    activeChip,
    setActiveChip,
    savedCount: savedIds.length,
    clearFilters,
  };
}
