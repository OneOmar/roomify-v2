import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseBrowserEnv } from "./env";

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Creates a per-request client with cookie-backed session (when using Supabase Auth).
 */
export async function createClient() {
  const { url, key } = getSupabaseBrowserEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component without mutable cookies; safe to ignore
          // when session refresh runs in middleware or Route Handler instead.
        }
      },
    },
  });
}
