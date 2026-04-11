# Supabase setup

This document describes how Supabase is integrated in Roomify (Next.js 15 App Router): dependencies, environment variables, database migrations, and how to use the client from application code.

## Installation

The project already includes the official Supabase packages. For a fresh clone or to reinstall:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- **`@supabase/supabase-js`** — Postgres, Auth, Storage, and Realtime APIs.
- **`@supabase/ssr`** — Browser and server clients that work with Next.js App Router and cookies (recommended for server components and route handlers).

## Environment variables

Copy `.env.example` to `.env.local` and set values from your Supabase project: [Dashboard](https://supabase.com/dashboard) → your project → **Project Settings** → **API**.

| Variable | Scope | Purpose |
| -------- | ----- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + server | Publishable (public) API key — same role as the legacy “anon” key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Legacy name; same value as the publishable key if your tooling still references it |

The app reads **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` first**, then falls back to **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**.

**Production and preview** hosts (e.g. Vercel) must define the same `NEXT_PUBLIC_*` variables. Never put the **service role** key in `NEXT_PUBLIC_*` or client-side code; use it only on the server if you need to bypass Row Level Security (RLS).

## Configuration in code

Supabase helpers live under `lib/supabase/`:

| Module | Use when |
| ------ | -------- |
| `lib/supabase/client.ts` | Client Components (`"use client"`), hooks, browser-only code |
| `lib/supabase/server.ts` | Server Components, Route Handlers, Server Actions |
| `lib/supabase/env.ts` | Shared validation for URL and key (used by both clients) |

Browser and server entry points are **separate files** so importing the browser client does not pull `next/headers` into client bundles.

## Database migrations

SQL migrations are versioned in `supabase/migrations/`. They are **not** applied automatically when you push to git; you must run them against your Supabase database.

### Apply via SQL Editor (simplest)

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor** → **New query**.
2. Paste the full contents of the migration file (e.g. `supabase/migrations/20260411120000_create_projects.sql`).
3. Run the script, then confirm the table in **Table Editor**.

### Apply via Supabase CLI (optional)

Use the [Supabase CLI](https://supabase.com/docs/guides/cli) when you want linked projects and repeatable remote migrations (`supabase link`, `supabase db push`). This repo may need `supabase init` and project linking the first time you adopt the CLI workflow.

### Schema note: `projects`

The initial migration defines `public.projects` with RLS **enabled** and **no policies for the `anon` role**, so the **publishable key** cannot read or write that table until you add RLS policies or perform data access with the **service role** on the server. See comments in the migration file for example policies (e.g. JWT `sub` matching `user_id` when you wire third-party auth).

## Usage

### Client Component

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
// Example: const { data, error } = await supabase.from("projects").select("*");
```

Call `createClient()` from event handlers or `useEffect` as needed; avoid relying on it during SSR render in client-only flows.

### Server Component, Route Handler, or Server Action

```tsx
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
// Example: const { data, error } = await supabase.from("projects").select("*");
```

## Notes for developers

- **Secrets**: Only expose the publishable key in `NEXT_PUBLIC_*`. The service role key belongs in server-only env vars (e.g. `SUPABASE_SERVICE_ROLE_KEY`) if you add it later — never commit it or prefix it with `NEXT_PUBLIC_`.
- **Clerk**: This app uses Clerk for user identity. Store Clerk user ids in `projects.user_id` as needed; align RLS policies with how you pass or validate identity to Supabase.
- **`.env.example`** is tracked in git; **`.env.local`** is ignored. Do not commit real keys.

## Further reading

- [Supabase + Next.js (App Router)](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
