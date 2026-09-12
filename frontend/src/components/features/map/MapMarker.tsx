import L from "leaflet";
import type { EventViewModel } from "@/types/events";

export function createEventIcon(): L.DivIcon {
  return L.divIcon({
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
}

export function createEventMarker(
  event: EventViewModel | any,
  locale: string,
  onMarkerClick?: (event: any) => void
): L.Marker | null {
  let lat: number | null = null;
  let lng: number | null = null;

  const coords = event.coordinates as any;
  if (coords && typeof coords === "object" && coords.coordinates) {
    lng = coords.coordinates[0];
    lat = coords.coordinates[1];
  }

  if (lat == null || lng == null) return null;

  const titles = event.title as Record<string, string> | null;
  const title =
    titles?.[locale] ||
    titles?.[event.originalLang] ||
    titles?.["en"] ||
    titles?.["es"] ||
    "Event";

  const marker = L.marker([lat, lng], { icon: createEventIcon() });

  if (onMarkerClick) {
    marker.on("click", () => onMarkerClick(event));
  }

  marker.bindPopup(`
    <div style="padding: 4px; font-family: sans-serif; min-width: 160px;">
      <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #f59e0b;">
        ${event.category}
      </p>
      <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #0f172a;">
        ${title}
      </h4>
      <p style="margin: 0; font-size: 12px; color: #475569;">
        📍 ${event.locationName || ""}
      </p>
    </div>
  `);

  return marker;
}
