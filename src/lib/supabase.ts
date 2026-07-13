import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-supabase-project-id.supabase.co" &&
    (supabaseAnonKey.startsWith("eyJ") || supabaseAnonKey.startsWith("sb_publishable_"))
);

if (!isSupabaseConfigured) {
  console.error(
    "🚨 SUPABASE NOT CONFIGURED: Invalid or missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. CRM Submissions are disabled."
  );
}

if (!isSupabaseConfigured && import.meta.env.PROD) {
  throw new Error(
    "Supabase is not configured for production. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
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
