"use client";

import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { BUSINESS_CATEGORIES, BUSINESS_ZONES, type BusinessCategory, type BusinessZone } from "@/types/host";

interface EditBusinessGeneralTabProps {
  readonly name: string;
  readonly category: BusinessCategory;
  readonly zone: BusinessZone;
  readonly whatsapp: string;
  readonly instagram: string;
  readonly bioEs: string;
  readonly coverUrl: string;
  readonly isUploading: boolean;
  readonly errors: Record<string, string>;
  readonly onNameChange: (v: string) => void;
  readonly onCategoryChange: (v: BusinessCategory) => void;
  readonly onZoneChange: (v: BusinessZone) => void;
  readonly onWhatsappChange: (v: string) => void;
  readonly onInstagramChange: (v: string) => void;
  readonly onBioEsChange: (v: string) => void;
  readonly onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EditBusinessGeneralTab({
  name,
  category,
  zone,
  whatsapp,
  instagram,
  bioEs,
  coverUrl,
  isUploading,
  errors,
  onNameChange,
  onCategoryChange,
  onZoneChange,
  onWhatsappChange,
  onInstagramChange,
  onBioEsChange,
  onImageUpload,
}: EditBusinessGeneralTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">Foto de Portada</label>
        <div className="mt-1.5 flex items-center gap-4">
          <div className="relative h-20 w-32 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-500"><ImageIcon className="h-6 w-6" /></div>
            )}
          </div>
          <label style={{ WebkitTapHighlightColor: "transparent" }} className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{isUploading ? "Optimizando..." : "Subir Foto"}</span>
            <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="edit-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Nombre *</label>
        <input id="edit-name" type="text" value={name} onChange={(e) => onNameChange(e.target.value)} autoComplete="organization" autoCorrect="off" spellCheck={false} className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
        {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-category" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Categoría *</label>
          <select id="edit-category" value={category} onChange={(e) => onCategoryChange(e.target.value as BusinessCategory)} className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50">
            {BUSINESS_CATEGORIES.map((cat) => <option key={cat} value={cat} className="capitalize">{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="edit-zone" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Zona *</label>
          <select id="edit-zone" value={zone} onChange={(e) => onZoneChange(e.target.value as BusinessZone)} className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50">
            {BUSINESS_ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-whatsapp" className="block text-xs font-bold uppercase tracking-wider text-slate-300">WhatsApp *</label>
          <input id="edit-whatsapp" type="tel" inputMode="tel" value={whatsapp} onChange={(e) => onWhatsappChange(e.target.value)} autoComplete="tel" className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
          {errors.whatsapp_number && <p className="mt-1 text-xs text-rose-400">{errors.whatsapp_number}</p>}
        </div>
        <div>
          <label htmlFor="edit-instagram" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Instagram</label>
          <input id="edit-instagram" type="text" value={instagram} onChange={(e) => onInstagramChange(e.target.value)} placeholder="ejemplo_tulum" autoCorrect="off" spellCheck={false} className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
        </div>
      </div>

      <div>
        <label htmlFor="edit-bio" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Descripción / Bio</label>
        <textarea id="edit-bio" rows={3} value={bioEs} onChange={(e) => onBioEsChange(e.target.value)} placeholder="Breve historia o propuesta de tu espacio..." className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
      </div>
    </div>
  );
}
