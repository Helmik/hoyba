"use client";

import Link from "next/link";
import { LogOut, ShieldCheck, Loader2, Building2, Calendar, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";
import type { SupportedLocale } from "@/types/i18n";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserNavDropdownProps {
  readonly locale: SupportedLocale;
  readonly user: SupabaseUser;
  readonly isAdmin: boolean;
  readonly isSigningOut: boolean;
  readonly onSignOut: () => Promise<void>;
  readonly onClose: () => void;
}

export default function UserNavDropdown({
  locale,
  user,
  isAdmin,
  isSigningOut,
  onSignOut,
  onClose,
}: UserNavDropdownProps) {
  const tAuth = useTranslations("auth");
  const tHost = useTranslations("host");

  return (
    <div
      id="user-dropdown-menu"
      role="menu"
      aria-orientation="vertical"
      className="absolute right-0 top-full mt-2 min-w-[220px] rounded-xl border border-slate-800 backdrop-blur-md bg-[#0B1218]/95 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2 py-1.5">
        <p className="truncate text-xs font-bold text-white">
          {user.user_metadata?.full_name || tAuth("myAccount")}
        </p>
        <p className="truncate text-[11px] text-slate-400">{user.email}</p>
        {isAdmin ? (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
            <ShieldCheck className="h-3 w-3" />
            {tAuth("roleAdmin")}
          </span>
        ) : (
          <span className="mt-1 inline-flex items-center rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
            {tAuth("roleOrganizer")}
          </span>
        )}
      </div>

      <div className="border-b border-slate-800 my-1" />

      <Link
        href={ROUTES.HOST_BUSINESSES(locale)}
        role="menuitem"
        onClick={onClose}
        className="flex min-h-[38px] items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/70 hover:text-white transition-colors"
      >
        <Building2 className="h-4 w-4 text-amber-400 shrink-0" />
        <span>{tHost("tabs.businesses")}</span>
      </Link>

      <Link
        href={ROUTES.HOST_POSTS(locale)}
        role="menuitem"
        onClick={onClose}
        className="flex min-h-[38px] items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/70 hover:text-white transition-colors"
      >
        <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
        <span>{tHost("tabs.posts")}</span>
      </Link>

      <div className="border-b border-slate-800 my-1" />

      <Link
        href={ROUTES.HOST_BUSINESS_NEW(locale)}
        role="menuitem"
        onClick={onClose}
        className="flex min-h-[38px] items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-amber-400 transition-colors"
      >
        <Plus className="h-4 w-4 text-slate-400 shrink-0" />
        <span>{tHost("newBusiness")}</span>
      </Link>

      <Link
        href={ROUTES.HOST_POST_NEW(locale)}
        role="menuitem"
        onClick={onClose}
        className="flex min-h-[38px] items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-amber-400 transition-colors"
      >
        <Plus className="h-4 w-4 text-slate-400 shrink-0" />
        <span>{tHost("newPost")}</span>
      </Link>

      <div className="border-b border-slate-800 my-1" />

      <button
        type="button"
        role="menuitem"
        disabled={isSigningOut}
        onClick={onSignOut}
        className="flex min-h-[38px] w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-60"
      >
        {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <LogOut className="h-4 w-4 shrink-0" />}
        <span>{isSigningOut ? `${tAuth("logout")}...` : tAuth("logout")}</span>
      </button>
    </div>
  );
}
