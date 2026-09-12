"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { signInAction, type AuthActionResult } from "../actions/auth.actions";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";
import { analytics } from "@/lib/analytics";

interface LoginFormProps {
  readonly locale: SupportedLocale;
  readonly initialEmail?: string;
  readonly messageFromQuery?: string;
}

export default function LoginForm({
  locale,
  initialEmail,
  messageFromQuery,
}: LoginFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(initialEmail || "");
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signInAction, null);

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    analytics.authSubmit({ type: "login", locale });

    const form = e.currentTarget;
    const formData = new FormData(form);
    const rawEmail = (formData.get("email") as string) || "";
    // Remove zero-width spaces (\u200B-\u200D\uFEFF) and non-breaking spaces (\u00A0) frequently added by Safari/iOS
    const cleanedEmail = rawEmail.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "").trim();

    if (!cleanedEmail) {
      e.preventDefault();
      setEmailError(locale === "es" ? "Introduce tu correo electrónico" : "Email is required");
      return;
    }

    // Standard RFC-compatible regex to avoid Safari false positives
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanedEmail)) {
      e.preventDefault();
      setEmailError(
        locale === "es"
          ? "Introduce un correo electrónico válido"
          : "Invalid email address"
      );
      return;
    }

    setEmailError(null);
  };

  return (
    <form
      noValidate
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input type="hidden" name="locale" value={locale} />

      {/* Query Message / Alert */}
      {messageFromQuery === "reset_success" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-400">
          {t("resetPasswordSuccess")}
        </div>
      )}

      {/* Error Message */}
      {state?.error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          {t("emailLabel")}
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="login-email"
            name="email"
            type="email"
            inputMode="email"
            required
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
            }}
            placeholder={t("emailPlaceholder")}
            className={`w-full rounded-2xl border bg-slate-950/70 py-3 pl-10 pr-4 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all ${
              emailError
                ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-800 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
            }`}
          />
        </div>
        {emailError && (
          <p role="alert" className="flex items-center gap-1.5 text-[11px] font-medium text-rose-400 pt-0.5">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{emailError}</span>
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="block text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            {t("passwordLabel")}
          </label>
          <Link
            href={
              email.trim()
                ? `${ROUTES.FORGOT_PASSWORD(locale)}?email=${encodeURIComponent(email.trim())}`
                : ROUTES.FORGOT_PASSWORD(locale)
            }
            prefetch={false}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            {t("forgotPasswordLink")}
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("loggingIn")}</span>
          </>
        ) : (
          <span>{t("submitLogin")}</span>
        )}
      </button>

      {/* Signup Redirect Link */}
      <div className="pt-2 text-center text-xs text-slate-400">
        <span>{t("noAccount")}{" "}</span>
        <Link
          href={
            email.trim()
              ? `${ROUTES.SIGNUP(locale)}?email=${encodeURIComponent(email.trim())}`
              : ROUTES.SIGNUP(locale)
          }
          prefetch={false}
          className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          {t("submitSignup")}
        </Link>
      </div>
    </form>
  );
}
