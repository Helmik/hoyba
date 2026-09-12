import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { captureAppError } from "@/lib/error";
import type { EmailOtpType } from "@supabase/supabase-js";
import { DEFAULT_LOCALE } from "@/types/i18n.types";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") || `/${DEFAULT_LOCALE}`;

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    captureAppError(error, { section: "api_auth_otp_callback" });
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    captureAppError(error, { section: "api_auth_pkce_callback" });
  }

  const loginUrl = new URL(`/${DEFAULT_LOCALE}/login`, request.url);
  loginUrl.searchParams.set("error", "callback_failed");
  return NextResponse.redirect(loginUrl);
}
