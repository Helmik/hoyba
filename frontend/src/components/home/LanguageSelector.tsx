"use client";

import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import type { SupportedLocale } from "@/types/i18n";
import { analytics } from "@/lib/analytics";

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

export default function LanguageSelector() {
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

  const currentConfig = LANGUAGE_LABELS[locale] || LANGUAGE_LABELS.es;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setLangMenuOpen(!langMenuOpen)}
        aria-label={tCommon("changeLanguage")}
        aria-expanded={langMenuOpen}
        className="flex min-h-[40px] items-center gap-1 rounded-full border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-all active:scale-[0.98] hover:border-amber-500/50 hover:text-white"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <Globe className="h-3.5 w-3.5 text-slate-400" />
        <span>{currentConfig.label}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {langMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
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
  );
}
