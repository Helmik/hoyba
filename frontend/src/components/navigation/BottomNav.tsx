"use client";

import { useTranslations } from "next-intl";
import { Calendar, Map, Star } from "lucide-react";

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

  const navItems = [
    {
      id: "agenda" as const,
      label: tNav("agenda"),
      icon: Calendar,
    },
    {
      id: "map" as const,
      label: tNav("map"),
      icon: Map,
    },
    {
      id: "saved" as const,
      label: tNav("saved"),
      icon: Star,
      badge: savedCount > 0 ? savedCount : null,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/80 backdrop-blur-lg bg-slate-950/95 sm:hidden pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-label={item.label}
              className={`relative flex min-h-[48px] flex-1 flex-col items-center justify-center py-2 transition-transform duration-100 active:scale-95 ${
                isActive
                  ? "text-amber-400 font-bold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "stroke-[2.5]" : "stroke-[1.75]"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[11px] leading-none tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 h-1 w-6 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
