import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-supabase-project-id.supabase.co"
);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    "[Supabase Enterprise Auth] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in .env. Authentication will run in local demo fallback mode until credentials are provided."
  );
}

// Fallback URL/Key so Vite does not throw unhandled exception on boot if .env is missing
const fallbackUrl = supabaseUrl || "https://placeholder-project.supabase.co";
const fallbackKey =
  supabaseAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.signature";

export const supabase: SupabaseClient = createClient(fallbackUrl, fallbackKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
