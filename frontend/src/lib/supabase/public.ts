import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSupabaseUrl, getSupabaseAnonKey } from "./env";

// Public Supabase client for ISR and Static Rendering (bypasses dynamic cookies)
export function createPublicClient() {
  return createSupabaseClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
