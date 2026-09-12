/**
 * Normalizes the Supabase Project URL to prevent "Invalid path specified in request URL" (PGRST125) errors.
 * Guards against environment variables configured with trailing slashes or sub-paths like /rest/v1 or /auth/v1.
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return url
    .trim()
    .replace(/\/(rest|auth|graphql|storage|functions)\/v1\/?$/, "")
    .replace(/\/+$/, "");
}

export function getSupabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
}
