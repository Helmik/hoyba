"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Compass, Globe, Map, List, ChevronDown } from "lucide-react";
import type { SupportedLocale } from "@/types/i18n";
import UserNavButton from "@/features/auth/components/UserNavButton";
import { analytics } from "@/lib/analytics";

interface HomeNavbarProps {
  readonly viewMode: "list" | "map";
  readonly onToggleView: () => void;
}

const LANGUAGE_LABELS: Record<SupportedLocale, { label: string; name: string }> = {
  es: { label: "ES", name: "Español" },
  en: { label: "EN", name: "English" },
  fr: { label: "FR", name: "Français" },
  de: { label: "DE", name: "Deutsch" },
  it: { label: "IT", name: "Italiano" },
  pt: { label: "PT", name: "Português" },
  nl: { label: "NL", name: "Nederlands" },
  ru: { label: "RU", name: "Русский" },
  uk: { label: "UK", name: "Українська" },
  pl: { label: "PL", name: "Polski" },
};

export default function HomeNavbar({ viewMode, onToggleView }: HomeNavbarProps) {
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleLocaleSelect = (newLocale: SupportedLocale) => {
    setLangMenuOpen(false);
    analytics.languageChange({ from: locale, to: newLocale });
    router.replace(pathname, { locale: newLocale });
  };

  const handleToggleView = () => {
    const nextMode = viewMode === "list" ? "map" : "list";
    analytics.viewModeToggle(nextMode);
    onToggleView();
  };

  const currentConfig = LANGUAGE_LABELS[locale] || LANGUAGE_LABELS.es;

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

        {/* Right Actions: View Toggle + Pill Language Selector */}
        <div className="flex items-center gap-2">
          {/* Toggle List / Map Button */}
          <button
            type="button"
            onClick={handleToggleView}
            aria-label={viewMode === "list" ? tHome("switchToMap") : tHome("switchToList")}
            className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-all active:scale-[0.98] hover:border-amber-500/50 hover:text-white"
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

          {/* Discreet Pill Language Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-label={tCommon("changeLanguage")}
              aria-expanded={langMenuOpen}
              className="flex min-h-[40px] items-center gap-1 rounded-full border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-all active:scale-[0.98] hover:border-amber-500/50 hover:text-white"
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentConfig.label}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl border border-slate-800 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto">
                  {(Object.keys(LANGUAGE_LABELS) as SupportedLocale[]).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLocaleSelect(loc)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        locale === loc
                          ? "bg-amber-500/10 text-amber-400 font-bold"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span>{LANGUAGE_LABELS[loc].name}</span>
                      <span className="text-[10px] uppercase text-slate-500 font-mono">
                        {LANGUAGE_LABELS[loc].label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User Account / Authentication Button */}
          <UserNavButton locale={locale} />
        </div>
      </div>
    </header>
  );
}
