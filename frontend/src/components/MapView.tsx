"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { EventViewModel } from "@/types/events";
import { useLocale } from "next-intl";
import { analytics } from "@/lib/analytics";

interface MapViewProps {
  events: (EventViewModel | any)[];
}

export default function MapView({ events }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      // Default center: Holbox coordinates
      const map = L.map(mapRef.current, {
        center: [21.5276, -87.3789],
        zoom: 14,
        zoomControl: false,
      });

      // CartoDB Dark Matter / Voyager light vector tiles
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

    // Custom amber marker icon
    const customIcon = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f59e0b;
          border: 2px solid #0f172a;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0f172a;
          font-weight: bold;
          font-size: 14px;
        ">
          ✦
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const bounds = L.latLngBounds([]);

    // Add markers for events that have coordinates
    events.forEach((event) => {
      let lat: number | null = null;
      let lng: number | null = null;

      // Extract coordinates from PostGIS geography object or fallback coordinates
      const coords = event.coordinates as any;
      if (coords && typeof coords === "object" && coords.coordinates) {
        lng = coords.coordinates[0];
        lat = coords.coordinates[1];
      }

      if (lat != null && lng != null) {
        const titles = event.title as Record<string, string> | null;
        const title =
          titles?.[locale] ||
          titles?.[event.originalLang] ||
          (titles as any)?.[(event as any).original_lang] ||
          titles?.["en"] ||
          "Event";

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.on("click", () => {
          analytics.mapMarkerClick({
            eventId: event.id,
            category: event.category,
          });
        });
        marker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif; min-width: 160px;">
            <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #f59e0b;">
              ${event.category}
            </p>
            <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #0f172a;">
              ${title}
            </h4>
            <p style="margin: 0; font-size: 12px; color: #475569;">
              📍 ${event.locationName || (event as any).location_name || ""}
            </p>
          </div>
        `);

        bounds.extend([lat, lng]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    return () => {
      // Keep map alive across re-renders
    };
  }, [events, locale]);

  return (
    <div className="relative h-[65vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-slate-800/80 shadow-2xl">
      <div ref={mapRef} className="h-full w-full z-10" />
    </div>
  );
}
