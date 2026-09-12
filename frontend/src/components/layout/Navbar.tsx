"use client";

import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { useLocale } from "next-intl";
import type { SupportedLocale } from "@/types/i18n.types";
import LanguageSelector from "./LanguageSelector";
import UserDropdown from "./UserDropdown";

export interface NavbarProps {
  rightActions?: React.ReactNode;
}

export default function Navbar({ rightActions }: NavbarProps) {
  const locale = useLocale() as SupportedLocale;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Compass className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
              Hoyba
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mt-0.5">
              Tulum Live
            </span>
          </div>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {rightActions}
          <LanguageSelector />
          <UserDropdown locale={locale} />
        </div>
      </div>
    </header>
  );
}
