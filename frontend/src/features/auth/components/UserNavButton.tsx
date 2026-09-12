"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "../actions/auth.actions";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";
import { analytics } from "@/lib/analytics";
import { useUserNavData } from "../hooks/useUserNavData";
import UserNavDropdown from "./UserNavDropdown";

interface UserNavButtonProps {
  readonly locale: SupportedLocale;
}

export default function UserNavButton({ locale }: UserNavButtonProps) {
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const { user, setUser, profileRole } = useUserNavData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      analytics.authSubmit({ type: "signout", locale });
      const supabase = createClient();
      await supabase.auth.signOut();
      await signOutAction(locale);
      setUser(null);
      setMenuOpen(false);
      router.push(ROUTES.HOME(locale));
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  const userInitials =
    user?.user_metadata?.full_name?.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="flex items-center gap-2">
      {!user ? (
        <Link
          href={ROUTES.LOGIN(locale)}
          className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold text-slate-200 transition-all hover:border-amber-500/50 hover:text-amber-400 active:scale-[0.98]"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <User className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">{tAuth("signInButton")}</span>
        </Link>
      ) : (
        <div className="relative" ref={menuRef}>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-controls="user-dropdown-menu"
            aria-label={tAuth("myAccount")}
            className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 py-1 pl-1.5 pr-2.5 text-xs font-semibold text-slate-200 transition-all hover:border-amber-500/50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-[11px] font-black text-slate-950 shadow-sm">
              {userInitials}
            </div>
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <UserNavDropdown
              locale={locale}
              user={user}
              isAdmin={profileRole === "admin"}
              isSigningOut={isSigningOut}
              onSignOut={handleSignOut}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
