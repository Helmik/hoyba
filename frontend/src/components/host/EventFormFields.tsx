"use client";

import { Building2 } from "lucide-react";
import type { Business } from "@/types/host";

interface EventFormFieldsProps {
  readonly businesses: Business[];
  readonly businessId: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly priceRange: string;
  readonly customWhatsappMsg: string;
  readonly errors: Record<string, string>;
  readonly onBusinessChange: (id: string) => void;
  readonly onTitleChange: (v: string) => void;
  readonly onDescriptionChange: (v: string) => void;
  readonly onCategoryChange: (v: string) => void;
  readonly onStartTimeChange: (v: string) => void;
  readonly onEndTimeChange: (v: string) => void;
  readonly onPriceRangeChange: (v: string) => void;
  readonly onCustomWhatsappMsgChange: (v: string) => void;
}

const CATEGORIES = ["wellness", "music", "art", "gastronomy", "nightlife"];

export default function EventFormFields({
  businesses,
  businessId,
  title,
  description,
  category,
  startTime,
  endTime,
  priceRange,
  customWhatsappMsg,
  errors,
  onBusinessChange,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onStartTimeChange,
  onEndTimeChange,
  onPriceRangeChange,
  onCustomWhatsappMsgChange,
}: EventFormFieldsProps) {
  return (
    <div className="space-y-4">
      {businesses.length > 1 && (
        <div>
          <label htmlFor="event-business" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Negocio Emisor *</label>
          <div className="relative mt-1.5">
            <Building2 className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <select id="event-business" value={businessId} onChange={(e) => onBusinessChange(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50">
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.zone})</option>)}
            </select>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="event-title" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Título de la Publicación *</label>
        <input id="event-title" type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Ej. Sesión de Sonoterapia & Sound Bath al Atardecer" autoCorrect="off" spellCheck={false} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
        {errors.title_es && <p className="mt-1 text-xs text-rose-400">{errors.title_es}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-category" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Categoría *</label>
          <select id="event-category" value={category} onChange={(e) => onCategoryChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white capitalize focus:outline-none focus:ring-1 focus:ring-amber-500/50">
            {CATEGORIES.map((cat) => <option key={cat} value={cat} className="capitalize">{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="event-price" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Precio / Rango</label>
          <input id="event-price" type="text" value={priceRange} onChange={(e) => onPriceRangeChange(e.target.value)} placeholder="Ej. Gratis o $350 MXN" autoCorrect="off" spellCheck={false} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-start" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Fecha y Hora de Inicio *</label>
          <input id="event-start" type="datetime-local" value={startTime} onChange={(e) => onStartTimeChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
          {errors.start_time && <p className="mt-1 text-xs text-rose-400">{errors.start_time}</p>}
        </div>
        <div>
          <label htmlFor="event-end" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Hora de Fin (Opcional)</label>
          <input id="event-end" type="datetime-local" value={endTime} onChange={(e) => onEndTimeChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
        </div>
      </div>

      <div>
        <label htmlFor="event-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Descripción de la Experiencia *</label>
        <textarea id="event-desc" rows={3} value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="Detalla qué incluye, vestimenta recomendada, qué traer..." className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
        {errors.description_es && <p className="mt-1 text-xs text-rose-400">{errors.description_es}</p>}
      </div>

      <div>
        <label htmlFor="event-whatsapp" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Mensaje Personalizado de WhatsApp</label>
        <input id="event-whatsapp" type="text" value={customWhatsappMsg} onChange={(e) => onCustomWhatsappMsgChange(e.target.value)} placeholder="Ej. ¡Hola! Me interesa reservar un lugar para el sound bath" autoCorrect="off" spellCheck={false} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
      </div>
    </div>
  );
}
