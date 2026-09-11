"use server";

import { createClient } from "@/lib/supabase/server";
import {
  LoginSchema,
  SignupSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  cleanEmail,
} from "../schemas/auth.schema";
import type { SupportedLocale } from "@/types/i18n";
import { ROUTES } from "@/constants/routes";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { captureAppError } from "@/lib/error";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
  redirectTo?: string;
}

function localizeAuthError(errorMessage: string, locale: SupportedLocale): string {
  const isEs = locale === "es";
  const lower = errorMessage.toLowerCase();

  if (lower.includes("first name must be at least 2 characters")) {
    return isEs ? "El nombre debe tener al menos 2 caracteres" : "First name must be at least 2 characters";
  }
  if (lower.includes("last name must be at least 2 characters")) {
    return isEs ? "Los apellidos deben tener al menos 2 caracteres" : "Last name must be at least 2 characters";
  }
  if (lower.includes("passwords do not match")) {
    return isEs ? "Las contraseñas no coinciden" : "Passwords do not match";
  }
  if (lower.includes("password must be at least 8 characters")) {
    return isEs ? "La contraseña debe tener al menos 8 caracteres" : "Password must be at least 8 characters";
  }
  if (lower.includes("invalid login credentials")) {
    return isEs ? "Correo o contraseña incorrectos" : "Invalid email or password";
  }
  if (lower.includes("email not confirmed")) {
    return isEs ? "Por favor confirma tu correo electrónico antes de ingresar" : "Please confirm your email before signing in";
  }
  if (lower.includes("invalid email")) {
    return isEs ? "Introduce un correo electrónico válido" : "Invalid email address";
  }
  if (
    lower.includes("user already registered") ||
    lower.includes("already registered") ||
    lower.includes("already been registered")
  ) {
    return isEs
      ? "Este correo electrónico ya está registrado. Por favor inicia sesión."
      : "This email is already registered. Please sign in.";
  }
  if (lower.includes("password is required")) {
    return isEs ? "Introduce tu contraseña" : "Password is required";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return isEs ? "Demasiados intentos. Espera unos momentos." : "Too many attempts. Please try again later.";
  }
  return errorMessage;
}

/**
 * Checks whether an email address is already registered in the profiles database.
 */
export async function checkEmailExistsAction(rawEmail: string): Promise<boolean> {
  const email = cleanEmail(rawEmail);
  if (!email || !email.includes("@")) return false;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("contact_email", email)
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Signs in a user with email and password.
 */
export async function signInAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const locale = (formData.get("locale") as SupportedLocale) || "en";

  const parsed = LoginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Validation failed";
    return {
      success: false,
      error: localizeAuthError(issue, locale),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    captureAppError(error, {
      section: "auth_signin",
      tags: { locale },
      extra: { email: parsed.data.email },
    });
    return {
      success: false,
      error: localizeAuthError(error.message, locale),
    };
  }

  // Update last_sign_in_at on profile
  if (data.user) {
    await supabase
      .from("profiles")
      .update({ last_sign_in_at: new Date().toISOString() })
      .eq("id", data.user.id);
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    redirectTo: ROUTES.HOME(locale),
  };
}

/**
 * Registers a new user and triggers confirmation email.
 */
export async function signUpAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawFirstName = formData.get("firstName");
  const rawLastName = formData.get("lastName");
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const rawConfirmPassword = formData.get("confirmPassword");
  const locale = (formData.get("locale") as SupportedLocale) || "en";

  const parsed = SignupSchema.safeParse({
    firstName: rawFirstName,
    lastName: rawLastName,
    email: rawEmail,
    password: rawPassword,
    confirmPassword: rawConfirmPassword,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Validation failed";
    return {
      success: false,
      error: localizeAuthError(issue, locale),
    };
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
  const supabase = await createClient();

  // 1. Direct validation: verify email has not been registered before in profiles
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("contact_email", parsed.data.email)
    .maybeSingle();

  if (existingProfile) {
    return {
      success: false,
      error: localizeAuthError("User already registered", locale),
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const callbackUrl = `${siteUrl}${ROUTES.AUTH_CALLBACK(locale)}?next=${encodeURIComponent(
    ROUTES.HOME(locale)
  )}`;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        full_name: fullName,
        name: fullName,
        role: "organizer",
      },
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    captureAppError(error, {
      section: "auth_signup",
      tags: { locale },
      extra: { email: parsed.data.email },
    });
    return {
      success: false,
      error: localizeAuthError(error.message, locale),
    };
  }

  // 2. Supabase Auth enumeration protection detection: existing user returns empty identities array
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      success: false,
      error: localizeAuthError("User already registered", locale),
    };
  }

  // If email confirmation is disabled or session was established immediately
  if (data.session) {
    revalidatePath("/", "layout");
    return {
      success: true,
      redirectTo: ROUTES.HOME(locale),
    };
  }

  return {
    success: true,
    message: "signup_pending_confirmation",
  };
}

/**
 * Requests a password reset email from Supabase Auth.
 */
export async function forgotPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawEmail = formData.get("email");
  const locale = (formData.get("locale") as SupportedLocale) || "en";

  const parsed = ForgotPasswordSchema.safeParse({ email: rawEmail });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid email address",
    };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetRedirectUrl = `${siteUrl}${ROUTES.AUTH_CALLBACK(locale)}?type=recovery&next=${encodeURIComponent(
    ROUTES.RESET_PASSWORD(locale)
  )}`;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: resetRedirectUrl,
  });

  if (error) {
    captureAppError(error, {
      section: "auth_forgot_password",
      tags: { locale },
    });
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "forgot_password_email_sent",
  };
}

/**
 * Sets a new password after a successful recovery callback.
 */
export async function resetPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawPassword = formData.get("password");
  const rawConfirmPassword = formData.get("confirmPassword");
  const locale = (formData.get("locale") as SupportedLocale) || "en";

  const parsed = ResetPasswordSchema.safeParse({
    password: rawPassword,
    confirmPassword: rawConfirmPassword,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    captureAppError(error, {
      section: "auth_reset_password",
      tags: { locale },
    });
    return {
      success: false,
      error: error.message,
    };
  }

  // Audit log entry for password change
  if (data.user) {
    await supabase.from("account_audit_logs").insert({
      user_id: data.user.id,
      event_type: "password_reset_completed",
      metadata: { timestamp: new Date().toISOString() },
    });
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    redirectTo: ROUTES.LOGIN(locale) + "?reset=success",
  };
}

/**
 * Signs out current user session.
 */
export async function signOutAction(locale: SupportedLocale = "en") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true, redirectTo: ROUTES.HOME(locale) };
}

/**
 * Retrieves the currently authenticated user and profile (for RSC or Server Actions).
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      user,
      profile: profile || null,
    };
  } catch {
    return null;
  }
}
