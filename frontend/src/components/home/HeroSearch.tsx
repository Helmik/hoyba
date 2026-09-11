"use client";

import { useLocale, useTranslations } from "next-intl";
import { Search, Calendar, MapPin } from "lucide-react";
import { TulumZone, type TulumZoneType } from "@/types/zones";
import type { SupportedLocale } from "@/types/i18n";
import { formatContextualDate } from "@/lib/date";
import { analytics } from "@/lib/analytics";

interface HeroSearchProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly activeZone: TulumZoneType;
  readonly onZoneSelect: (zone: TulumZoneType) => void;
}

const ZONE_LIST: readonly TulumZoneType[] = [
  TulumZone.ALL,
  TulumZone.LA_VELETA,
  TulumZone.ALDEA_ZAMA,
  TulumZone.CENTRO,
  TulumZone.ZONA_COSTERA,
] as const;

export default function HeroSearch({
  searchQuery,
  onSearchChange,
  activeZone,
  onZoneSelect,
}: HeroSearchProps) {
  const tHome = useTranslations("home");
  const tZones = useTranslations("zones");
  const locale = useLocale() as SupportedLocale;

  // Dynamic contextual date: "Hoy • Miércoles, 9 Sep"
  const formattedDate = formatContextualDate(new Date(), locale, tHome("today"));

  return (
    <section className="space-y-3.5 pt-1">
      {/* Dynamic Date Label with suppressHydrationWarning */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
        <Calendar className="h-4 w-4" />
        <span suppressHydrationWarning>{formattedDate}</span>
      </div>

      {/* Accessible Search Input with rounded-2xl */}
      <div className="relative w-full">
        <label htmlFor="event-search" className="sr-only">
          {tHome("searchPlaceholder")}
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          id="event-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onBlur={(e) => analytics.searchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              analytics.searchQuery(searchQuery);
            }
          }}
          placeholder={tHome("searchPlaceholder")}
          className="w-full h-12 md:h-13 rounded-2xl border border-slate-800 bg-slate-900/90 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-400 transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {/* Horizontal Scrollable Zones Bar */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 min-w-max px-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
            <MapPin className="h-3 w-3" />
            {tHome("zonesLabel")}
          </span>
          {ZONE_LIST.map((zone) => {
            const isActive = activeZone === zone;
            return (
              <button
                key={zone}
                type="button"
                onClick={() => {
                  onZoneSelect(zone);
                  analytics.zoneFilter(zone);
                }}
                className={`min-h-[38px] rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]"
                    : "border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                {tZones(zone as any)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
