"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import type { EventViewModel } from "@/types/events";
import { useLocale } from "next-intl";
import { analytics } from "@/lib/analytics";
import { createEventMarker } from "./MapMarker";

export interface LeafletMapProps {
  events: (EventViewModel | any)[];
  className?: string;
}

export default function LeafletMap({ events, className }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      const map = L.map(mapRef.current, {
        center: [21.5276, -87.3789],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      leafletInstance.current = map;
    }

    const map = leafletInstance.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);

    events.forEach((event) => {
      const marker = createEventMarker(event, locale, (evt) => {
        analytics.mapMarkerClick({
          eventId: evt.id,
          category: evt.category,
        });
      });

      if (marker) {
        marker.addTo(map);
        bounds.extend(marker.getLatLng());
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [events, locale]);

  return (
    <div
      ref={mapRef}
      className={className || "h-[calc(100dvh-13rem)] w-full rounded-2xl overflow-hidden border border-slate-800 z-0"}
    />
  );
}
