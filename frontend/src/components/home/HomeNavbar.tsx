"use client";

import { useLocale, useTranslations } from "next-intl";
import { Compass, Map, List } from "lucide-react";
import type { SupportedLocale } from "@/types/i18n";
import UserNavButton from "@/features/auth/components/UserNavButton";
import LanguageSelector from "./LanguageSelector";
import { analytics } from "@/lib/analytics";

interface HomeNavbarProps {
  readonly viewMode: "list" | "map";
  readonly onToggleView: () => void;
}

export default function HomeNavbar({ viewMode, onToggleView }: HomeNavbarProps) {
  const tHome = useTranslations("home");
  const locale = useLocale() as SupportedLocale;

  const handleToggleView = () => {
    const nextMode = viewMode === "list" ? "map" : "list";
    analytics.viewModeToggle(nextMode);
    onToggleView();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Compass className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
              {tHome("pulsoTitle")}
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mt-0.5">
              Hoyba • Tulum Live
            </span>
          </div>
        </div>

        {/* Right Actions: View Toggle + Pill Language Selector + User Nav Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleView}
            aria-label={viewMode === "list" ? tHome("switchToMap") : tHome("switchToList")}
            className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-all active:scale-[0.98] hover:border-amber-500/50 hover:text-white"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {viewMode === "list" ? (
              <>
                <Map className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden xs:inline">{tHome("switchToMap")}</span>
              </>
            ) : (
              <>
                <List className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden xs:inline">{tHome("switchToList")}</span>
              </>
            )}
          </button>

          <LanguageSelector />
          <UserNavButton locale={locale} />
        </div>
      </div>
    </header>
  );
}
