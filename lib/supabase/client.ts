import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseBrowserEnv } from "./env";

/**
 * Supabase client for Client Components, hooks, and browser-only code.
 * Call from event handlers or inside `useEffect`; do not call during SSR render.
 */
export function createClient() {
  const { url, key } = getSupabaseBrowserEnv();
  return createBrowserClient(url, key);
}
