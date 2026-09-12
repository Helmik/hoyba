"use client";

import { BUSINESS_CATEGORIES, BUSINESS_ZONES, type BusinessCategory, type BusinessZone } from "@/types/host";

interface QuickBusinessFieldsProps {
  readonly name: string;
  readonly category: BusinessCategory;
  readonly zone: BusinessZone;
  readonly whatsapp: string;
  readonly errors: Record<string, string>;
  readonly onNameChange: (val: string) => void;
  readonly onCategoryChange: (val: BusinessCategory) => void;
  readonly onZoneChange: (val: BusinessZone) => void;
  readonly onWhatsappChange: (val: string) => void;
}

export default function QuickBusinessFields({
  name,
  category,
  zone,
  whatsapp,
  errors,
  onNameChange,
  onCategoryChange,
  onZoneChange,
  onWhatsappChange,
}: QuickBusinessFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="business-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Nombre del Negocio *</label>
        <input
          id="business-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej. Casa Jaguar, Palma Central..."
          autoComplete="organization"
          autoCorrect="off"
          spellCheck={false}
          className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        />
        {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="business-category" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Categoría *</label>
          <select
            id="business-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as BusinessCategory)}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          >
            {BUSINESS_CATEGORIES.map((cat) => <option key={cat} value={cat} className="capitalize">{cat}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="business-zone" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Zona en Tulum *</label>
          <select
            id="business-zone"
            value={zone}
            onChange={(e) => onZoneChange(e.target.value as BusinessZone)}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          >
            {BUSINESS_ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="business-whatsapp" className="block text-xs font-bold uppercase tracking-wider text-slate-300">WhatsApp de Reservaciones *</label>
        <input
          id="business-whatsapp"
          type="tel"
          inputMode="tel"
          value={whatsapp}
          onChange={(e) => onWhatsappChange(e.target.value)}
          placeholder="529841234567"
          autoComplete="tel"
          className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        />
        {errors.whatsapp_number && <p className="mt-1 text-xs text-rose-400">{errors.whatsapp_number}</p>}
      </div>
    </>
  );
}
