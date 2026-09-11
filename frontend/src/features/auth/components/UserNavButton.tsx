"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { User, LogOut, ShieldCheck, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "../actions/auth.actions";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserNavButtonProps {
  readonly locale: SupportedLocale;
}

export default function UserNavButton({ locale }: UserNavButtonProps) {
  const t = useTranslations("auth");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // Check active session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.role) setProfileRole(data.role);
          });
      }
    });

    // Subscribe to auth state transitions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Guest State: Sign In Link
  if (!user) {
    return (
      <Link
        href={ROUTES.LOGIN(locale)}
        className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold text-slate-200 transition-all hover:border-amber-500/50 hover:text-amber-400 active:scale-[0.98]"
      >
        <User className="h-3.5 w-3.5 text-amber-400" />
        <span className="hidden sm:inline">{t("signInButton")}</span>
      </Link>
    );
  }

  // Authenticated State: Avatar & Dropdown
  const userInitials =
    user.user_metadata?.full_name
      ?.split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user.email?.slice(0, 2).toUpperCase() ||
    "U";

  const isAdmin = profileRole === "admin";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label={t("myAccount")}
        className="flex min-h-[40px] items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 py-1 pl-1.5 pr-2.5 text-xs font-semibold text-slate-200 transition-all hover:border-amber-500/50 active:scale-[0.98]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-[11px] font-black text-slate-950 shadow-sm">
          {userInitials}
        </div>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="border-b border-slate-800/80 px-3 py-2.5">
            <p className="truncate text-xs font-bold text-white">
              {user.user_metadata?.full_name || t("myAccount")}
            </p>
            <p className="truncate text-[11px] text-slate-400">{user.email}</p>
            {isAdmin ? (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                <ShieldCheck className="h-3 w-3" />
                {t("roleAdmin")}
              </span>
            ) : (
              <span className="mt-1.5 inline-flex items-center rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                {t("roleOrganizer")}
              </span>
            )}
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                signOutAction(locale);
              }}
              className="flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t("logout")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
