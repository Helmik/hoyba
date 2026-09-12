import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";
import type { SupportedLocale } from "@/types/i18n";
import { captureAppError } from "@/lib/error";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") || ROUTES.HOME(locale as SupportedLocale);

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    captureAppError(error, {
      section: "auth_otp_callback",
      tags: { locale },
    });
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    captureAppError(error, {
      section: "auth_pkce_callback",
      tags: { locale },
    });
  }

  // If recovery failed or link expired, redirect to recovery page so user can re-request
  if (type === "recovery" || requestUrl.searchParams.get("type") === "recovery") {
    const recoveryUrl = new URL(ROUTES.RECOVER_PASSWORD(locale as SupportedLocale), request.url);
    recoveryUrl.searchParams.set("error", "link_expired");
    return NextResponse.redirect(recoveryUrl);
  }

  // If exchange failed or code was missing, return to login with error
  const loginUrl = new URL(ROUTES.LOGIN(locale as SupportedLocale), request.url);
  loginUrl.searchParams.set("error", "callback_failed");
  return NextResponse.redirect(loginUrl);
}
