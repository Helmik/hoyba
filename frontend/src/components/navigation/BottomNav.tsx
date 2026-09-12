"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calendar, Map, Star, Plus } from "lucide-react";
import { analytics } from "@/lib/analytics";
import type { SupportedLocale } from "@/types/i18n";
import BottomNavHostSheet from "./BottomNavHostSheet";

export type BottomNavTab = "agenda" | "map" | "saved";

interface BottomNavProps {
  readonly activeTab: BottomNavTab;
  readonly onSelectTab: (tab: BottomNavTab) => void;
  readonly savedCount?: number;
}

export default function BottomNav({
  activeTab,
  onSelectTab,
  savedCount = 0,
}: BottomNavProps) {
  const tNav = useTranslations("nav");
  const locale = useLocale() as SupportedLocale;
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && sheetOpen) setSheetOpen(false);
    }
    if (sheetOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sheetOpen]);

  const navTabs: Array<{ id: BottomNavTab; label: string; icon: typeof Calendar; badge?: number }> = [
    { id: "agenda", label: tNav("agenda"), icon: Calendar },
    { id: "map", label: tNav("map"), icon: Map },
    { id: "saved", label: tNav("saved"), icon: Star, badge: savedCount },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Navigation Bar"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 backdrop-blur-lg bg-slate-950/95 sm:hidden pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-2">
          {navTabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectTab(tab.id);
                  analytics.navTabChange(tab.id);
                }}
                aria-label={tab.label}
                style={{ WebkitTapHighlightColor: "transparent" }}
                className={`relative flex min-h-[48px] flex-1 flex-col items-center justify-center py-2 transition-transform duration-100 active:scale-95 ${
                  isActive ? "text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200 font-medium"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                <span className="mt-1 text-[11px] leading-none tracking-tight">{tab.label}</span>
                {isActive && <span className="absolute bottom-1 h-1 w-6 rounded-full bg-amber-400" />}
              </button>
            );
          })}

          {/* Central Thumb Quick Action Button */}
          <div className="relative flex flex-1 items-center justify-center py-1">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label="Host Quick Menu"
              style={{ WebkitTapHighlightColor: "transparent" }}
              className="group relative -mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 transition-transform duration-150 active:scale-90"
            >
              <Plus className="h-6 w-6 stroke-[3] transition-transform duration-200 group-hover:rotate-90" />
            </button>
          </div>

          {/* Tab 3: Saved */}
          <button
            type="button"
            onClick={() => {
              onSelectTab("saved");
              analytics.navTabChange("saved");
            }}
            aria-label={tNav("saved")}
            style={{ WebkitTapHighlightColor: "transparent" }}
            className={`relative flex min-h-[48px] flex-1 flex-col items-center justify-center py-2 transition-transform duration-100 active:scale-95 ${
              activeTab === "saved" ? "text-amber-400 font-bold" : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            <div className="relative">
              <Star className={`h-5 w-5 ${activeTab === "saved" ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              {savedCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-950">
                  {savedCount > 99 ? "99+" : savedCount}
                </span>
              )}
            </div>
            <span className="mt-1 text-[11px] leading-none tracking-tight">{tNav("saved")}</span>
            {activeTab === "saved" && <span className="absolute bottom-1 h-1 w-6 rounded-full bg-amber-400" />}
          </button>
        </div>
      </nav>

      <BottomNavHostSheet isOpen={sheetOpen} locale={locale} onClose={() => setSheetOpen(false)} />
    </>
  );
}
