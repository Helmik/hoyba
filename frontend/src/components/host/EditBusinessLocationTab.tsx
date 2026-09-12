"use client";

import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/host/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-900" />,
});

interface EditBusinessLocationTabProps {
  readonly addressDetails: string;
  readonly coords: { lat: number; lng: number };
  readonly onAddressDetailsChange: (v: string) => void;
  readonly onCoordsChange: (coords: { lat: number; lng: number }) => void;
}

export default function EditBusinessLocationTab({
  addressDetails,
  coords,
  onAddressDetailsChange,
  onCoordsChange,
}: EditBusinessLocationTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="edit-address" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Dirección o Referencias
        </label>
        <input
          id="edit-address"
          type="text"
          value={addressDetails}
          onChange={(e) => onAddressDetailsChange(e.target.value)}
          placeholder="Ej. Calle 7 Sur entre 2 y 4, La Veleta..."
          autoCorrect="off"
          spellCheck={false}
          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
          Ubicación Geográfica en Mapa (PostGIS)
        </label>
        <LocationPicker value={coords} onChange={onCoordsChange} heightClass="h-72" />
      </div>
    </div>
  );
}
