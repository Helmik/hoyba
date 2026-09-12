"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  resetPasswordAction,
  forgotPasswordAction,
  type AuthActionResult,
} from "../actions/auth.actions";
import type { SupportedLocale } from "@/types/i18n";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";
import { analytics } from "@/lib/analytics";

interface RecoverPasswordFormProps {
  readonly locale: SupportedLocale;
  readonly errorCode?: string;
}

export default function RecoverPasswordForm({
  locale,
  errorCode,
}: RecoverPasswordFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  // Link expired or invalid link state
  const isUrlExpired = errorCode === "link_expired";
  const [linkExpired, setLinkExpired] = useState(isUrlExpired);

  // Re-request link state
  const [reRequestEmail, setReRequestEmail] = useState("");
  const [isRequestingLink, setIsRequestingLink] = useState(false);
  const [reRequestSuccess, setReRequestSuccess] = useState(false);
  const [reRequestError, setReRequestError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(resetPasswordAction, null);

  // Check for hash parameters (#error=... or #access_token=...) on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash.includes("error=")) {
      setLinkExpired(true);
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setLinkExpired(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  // Real-time validations
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol =
    /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const formatAuthErrorMessage = (errorStr: string): string => {
    const isEs = locale === "es";
    const lower = errorStr.toLowerCase();

    if (
      lower.includes("rate limit") ||
      lower.includes("too many requests") ||
      lower.includes("exceeded") ||
      lower.includes("once every") ||
      lower.includes("over_email_send_rate_limit")
    ) {
      return t("rateLimitError");
    }

    if (lower.includes("invalid email") || lower.includes("valid email")) {
      return isEs
        ? "Introduce un correo electrónico válido."
        : "Please enter a valid email address.";
    }

    if (lower.includes("user not found")) {
      return isEs
        ? "No encontramos ninguna cuenta registrada con este correo electrónico."
        : "No account found with this email address.";
    }

    if (
      lower.includes("token has expired") ||
      lower.includes("otp_expired") ||
      lower.includes("session_not_found")
    ) {
      return isEs
        ? "El enlace de recuperación ha expirado o no es válido. Por favor solicita uno nuevo."
        : "The recovery link has expired or is invalid. Please request a new one.";
    }

    return errorStr;
  };

  const strengthScore = [
    hasMinLength,
    hasNumberOrSymbol,
    password.length >= 12,
  ].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);

    if (!hasMinLength) {
      e.preventDefault();
      setClientError(
        locale === "es"
          ? "La contraseña debe tener al menos 8 caracteres."
          : "Password must be at least 8 characters."
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

    analytics.authSubmit({ type: "reset_password", locale });
  };

  const handleReRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = reRequestEmail.trim();
    if (!cleanEmail) return;

    setIsRequestingLink(true);
    setReRequestError(null);

    try {
      const formData = new FormData();
      formData.set("email", cleanEmail);
      formData.set("locale", locale);
      const res = await forgotPasswordAction(null, formData);

      if (res.success) {
        setReRequestSuccess(true);
      } else {
        setReRequestError(res.error || "No se pudo enviar el correo");
      }
    } catch {
      setReRequestError(
        locale === "es"
          ? "Ocurrió un error al enviar el enlace. Intenta de nuevo."
          : "An error occurred while sending the link. Please try again."
      );
    } finally {
      setIsRequestingLink(false);
    }
  };

  // If link is expired, show the inline recovery request form
  if (linkExpired) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 space-y-2"
        >
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {locale === "es"
                ? "Enlace de recuperación expirado"
                : "Recovery link expired"}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {locale === "es"
              ? "Este enlace ya ha sido utilizado o ha vencido por seguridad. Introduce tu correo para recibir un nuevo enlace de recuperación."
              : "This link has already been used or has expired for security. Enter your email to receive a new recovery link."}
          </p>
        </div>

        {reRequestSuccess ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-emerald-300">
              {t("forgotPasswordSuccess")}
            </p>
            <Link
              href={ROUTES.LOGIN(locale)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors pt-1"
            >
              <span>{t("submitLogin")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReRequestLink} className="space-y-3">
            {reRequestError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs font-semibold text-rose-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{formatAuthErrorMessage(reRequestError)}</span>
              </div>
            )}

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={reRequestEmail}
                onChange={(e) => setReRequestEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-4 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isRequestingLink}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
            >
              {isRequestingLink ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("sendingEmail")}</span>
                </>
              ) : (
                <span>
                  {locale === "es"
                    ? "Enviar nuevo enlace"
                    : "Send new link"}
                </span>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-slate-400">
          <Link
            href={ROUTES.LOGIN(locale)}
            className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            {t("rememberPassword")} {t("submitLogin")}
          </Link>
        </div>
      </div>
    );
  }

  // Active password recovery form
  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      <input type="hidden" name="locale" value={locale} />

      {/* Security badge */}
      <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] font-medium text-amber-300/90">
        <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
        <span>
          {locale === "es"
            ? "Crea una contraseña segura para tu cuenta en Hoyba."
            : "Create a secure password for your Hoyba account."}
        </span>
      </div>

      {/* Server or Client Error Alert */}
      {(clientError || state?.error) && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formatAuthErrorMessage(clientError || state?.error || "")}</span>
        </div>
      )}

      {/* New Password Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="recover-password"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="recover-password"
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
          htmlFor="recover-confirmPassword"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            id="recover-confirmPassword"
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
            <span>{t("savingPassword")}</span>
          </>
        ) : (
          <span>
            {locale === "es"
              ? "Restablecer Contraseña"
              : t("submitResetPassword")}
          </span>
        )}
      </button>

      {/* Back to Login Link */}
      <div className="pt-2 text-center text-xs text-slate-400">
        <Link
          href={ROUTES.LOGIN(locale)}
          className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          {t("rememberPassword")} {t("submitLogin")}
        </Link>
      </div>
    </form>
  );
}
