"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TULUM_DEFAULT_COORDS } from "@/constants/config";

interface LocationPickerProps {
  readonly value?: { lat: number; lng: number } | null;
  readonly onChange: (coords: { lat: number; lng: number }) => void;
  readonly heightClass?: string;
}

export default function LocationPicker({
  value,
  onChange,
  heightClass = "h-64",
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const initialLat = value?.lat ?? TULUM_DEFAULT_COORDS.lat;
  const initialLng = value?.lng ?? TULUM_DEFAULT_COORDS.lng;

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const pinIcon = L.divIcon({
      className: "custom-map-pin",
      html: `<div style="width:32px;height:32px;border-radius:50%;background:#f59e0b;border:3px solid #0f172a;box-shadow:0 4px 12px rgba(245,158,11,0.5);display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:900;font-size:16px;">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([initialLat, initialLng], { draggable: true, icon: pinIcon }).addTo(map);

    const syncCoords = (latlng: L.LatLng) => {
      onChange({ lat: Number(latlng.lat.toFixed(6)), lng: Number(latlng.lng.toFixed(6)) });
    };

    marker.on("dragend", () => syncCoords(marker.getLatLng()));
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      syncCoords(e.latlng);
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;
  }, [initialLat, initialLng, onChange]);

  useEffect(() => {
    if (value && markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - value.lat) > 0.0001 || Math.abs(currentPos.lng - value.lng) > 0.0001) {
        markerRef.current.setLatLng([value.lat, value.lng]);
        mapInstanceRef.current.setView([value.lat, value.lng], mapInstanceRef.current.getZoom());
      }
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className={`relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 ${heightClass}`}>
        <div ref={mapContainerRef} className="h-full w-full z-10" />
      </div>
      <p className="text-xs text-slate-400">
        Haz clic o arrastra el pin para fijar la ubicación exacta ({value ? `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}` : "Tulum"})
      </p>
    </div>
  );
}
