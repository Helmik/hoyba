"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { signUpAction, type AuthActionResult } from "../actions/auth.actions";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";

interface SignupFormProps {
  readonly locale: SupportedLocale;
}

export default function SignupForm({ locale }: SignupFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signUpAction, null);

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  // When email confirmation is required
  if (state?.success && state.message === "signup_pending_confirmation") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-white">
          {t("signupSuccess")}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Hemos enviado un correo de confirmación a tu dirección para activar tu cuenta.
        </p>
        <div className="pt-4">
          <Link
            href={ROUTES.LOGIN(locale)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80 px-6 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {t("submitLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3.5">
      <input type="hidden" name="locale" value={locale} />

      {/* Error Alert */}
      {state?.error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Full Name Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-fullName"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          {t("fullNameLabel")}
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="signup-fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder={t("fullNamePlaceholder")}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-4 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-email"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          {t("emailLabel")}
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-4 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-password"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder={t("passwordPlaceholder")}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-10 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="signup-confirmPassword"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="signup-confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder={t("confirmPasswordPlaceholder")}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-4 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("signingUp")}</span>
          </>
        ) : (
          <span>{t("submitSignup")}</span>
        )}
      </button>

      {/* Login Redirect Link */}
      <div className="pt-2 text-center text-xs text-slate-400">
        <span>{t("haveAccount")}{" "}</span>
        <Link
          href={ROUTES.LOGIN(locale)}
          className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          {t("submitLogin")}
        </Link>
      </div>
    </form>
  );
}
