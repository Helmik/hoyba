"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { signUpAction, checkEmailExistsAction, type AuthActionResult } from "../actions/auth.actions";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";
import { analytics } from "@/lib/analytics";

interface SignupFormProps {
  readonly locale: SupportedLocale;
  readonly initialEmail?: string;
}

export default function SignupForm({ locale, initialEmail = "" }: SignupFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [clientError, setClientError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Real-time validations identical to password recovery
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol =
    /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const strengthScore = [
    hasMinLength,
    hasNumberOrSymbol,
    password.length >= 12,
  ].filter(Boolean).length;

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

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

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const rawEmail = e.target.value.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) return;

    try {
      const exists = await checkEmailExistsAction(rawEmail);
      if (exists) {
        setEmailError(
          locale === "es"
            ? "Este correo ya está registrado. Por favor inicia sesión."
            : "This email is already registered. Please sign in."
        );
      } else {
        setEmailError(null);
      }
    } catch {
      // Non-blocking
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    analytics.authSubmit({ type: "signup", locale });

    const form = e.currentTarget;
    const formData = new FormData(form);
    const firstName = ((formData.get("firstName") as string) || "").trim();
    const lastName = ((formData.get("lastName") as string) || "").trim();
    const rawEmail = ((formData.get("email") as string) || "")
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
      .trim();

    if (firstName.length < 2) {
      e.preventDefault();
      setClientError(locale === "es" ? "El nombre debe tener al menos 2 caracteres" : "First name must be at least 2 characters");
      return;
    }

    if (lastName.length < 2) {
      e.preventDefault();
      setClientError(locale === "es" ? "Los apellidos deben tener al menos 2 caracteres" : "Last name must be at least 2 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      e.preventDefault();
      setClientError(locale === "es" ? "Introduce un correo electrónico válido" : "Invalid email address");
      return;
    }

    if (!hasMinLength) {
      e.preventDefault();
      setClientError(
        locale === "es"
          ? "La contraseña debe tener al menos 8 caracteres."
          : "Password must be at least 8 characters."
      );
      return;
    }

    if (!hasNumberOrSymbol) {
      e.preventDefault();
      setClientError(
        locale === "es"
          ? "La contraseña debe incluir al menos un número o símbolo."
          : "Password must include at least one number or symbol."
      );
      return;
    }

    if (password !== confirmPassword) {
      e.preventDefault();
      setClientError(
        locale === "es"
          ? "Las contraseñas no coinciden."
          : "Passwords do not match."
      );
      return;
    }

    setClientError(null);
  };

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

  const displayedError = clientError || state?.error;

  return (
    <form
      noValidate
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-3.5"
    >
      <input type="hidden" name="locale" value={locale} />

      {/* Error Alert */}
      {displayedError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      {/* Name Fields: First Name & Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* First Name Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-firstName"
            className="block text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            {t("firstNameLabel")}
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              id="signup-firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              autoCapitalize="words"
              spellCheck={false}
              onChange={() => setClientError(null)}
              placeholder={t("firstNamePlaceholder")}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-4 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Last Name Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-lastName"
            className="block text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            {t("lastNameLabel")}
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              id="signup-lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              autoCapitalize="words"
              spellCheck={false}
              onChange={() => setClientError(null)}
              placeholder={t("lastNamePlaceholder")}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-4 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
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
            inputMode="email"
            required
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onBlur={handleEmailBlur}
            onChange={(e) => {
              setEmail(e.target.value);
              setClientError(null);
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
          <div role="alert" className="flex items-center justify-between text-[11px] font-medium text-rose-400 pt-0.5">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{emailError}</span>
            </span>
            <Link
              href={
                email.trim()
                  ? `${ROUTES.LOGIN(locale)}?email=${encodeURIComponent(email.trim())}`
                  : ROUTES.LOGIN(locale)
              }
              prefetch={false}
              className="text-amber-400 font-bold hover:text-amber-300 transition-colors ml-2 shrink-0 underline"
            >
              {t("submitLogin")}
            </Link>
          </div>
        )}
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
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setClientError(null);
            }}
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

        {/* Strength Meter */}
        {password.length > 0 && (
          <div className="pt-1.5 space-y-1.5">
            <div className="flex gap-1.5 h-1 w-full">
              <div
                className={`h-full flex-1 rounded-full transition-all ${
                  strengthScore >= 1 ? "bg-amber-500" : "bg-slate-800"
                }`}
              />
              <div
                className={`h-full flex-1 rounded-full transition-all ${
                  strengthScore >= 2 ? "bg-amber-400" : "bg-slate-800"
                }`}
              />
              <div
                className={`h-full flex-1 rounded-full transition-all ${
                  strengthScore >= 3 ? "bg-emerald-400" : "bg-slate-800"
                }`}
              />
            </div>
          </div>
        )}
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
            type={showConfirmPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setClientError(null);
            }}
            placeholder={t("confirmPasswordPlaceholder")}
            className={`w-full rounded-2xl border bg-slate-950/70 py-3 pl-10 pr-10 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all ${
              confirmPassword.length > 0 && !passwordsMatch
                ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-800 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label="Toggle confirm password visibility"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1 rounded-xl bg-slate-950/40 border border-slate-900 p-3 text-[11px]">
        <div
          className={`flex items-center gap-1.5 ${
            hasMinLength ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>
            {locale === "es"
              ? "Mínimo 8 caracteres"
              : "At least 8 characters"}
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 ${
            hasNumberOrSymbol ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>
            {locale === "es"
              ? "Incluye número o símbolo"
              : "Includes a number or symbol"}
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 ${
            passwordsMatch ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>
            {locale === "es"
              ? "Las contraseñas coinciden"
              : "Passwords match"}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !hasMinLength || !hasNumberOrSymbol || !passwordsMatch}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
          href={
            email.trim()
              ? `${ROUTES.LOGIN(locale)}?email=${encodeURIComponent(email.trim())}`
              : ROUTES.LOGIN(locale)
          }
          prefetch={false}
          className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          {t("submitLogin")}
        </Link>
      </div>
    </form>
  );
}
