import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";
import type { SupportedLocale } from "@/types/i18n";
import { captureAppError } from "@/lib/error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || ROUTES.HOME(locale as SupportedLocale);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    captureAppError(error, {
      section: "auth_pkce_callback",
      tags: { locale },
    });
  }

  // If exchange failed or code was missing, return to login with error
  const loginUrl = new URL(ROUTES.LOGIN(locale as SupportedLocale), request.url);
  loginUrl.searchParams.set("error", "callback_failed");
  return NextResponse.redirect(loginUrl);
}
