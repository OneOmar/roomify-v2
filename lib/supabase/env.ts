/**
 * Shared Supabase env validation (safe to import from client or server bundles).
 *
 * Dashboard label: "Publishable key" — same value as the legacy "anon" / public API key.
 */
export function getSupabaseBrowserEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY). Copy .env.example to .env.local and set values from your Supabase project API settings."
    );
  }

  return { url, key };
}
