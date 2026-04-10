# Clerk authentication setup

This document describes how Clerk is integrated in Roomify (Next.js 15 App Router) and how to configure and extend it.

## Installation

The project already includes Clerk. To add it in a fresh clone or reference the dependency:

```bash
npm install @clerk/nextjs
```

Ensure **React** and **React DOM** meet `@clerk/nextjs` peer requirements (this repo uses React 19.1.x).

## Configuration in code

1. **`ClerkProvider`** wraps the app in `app/layout.tsx` so Clerk’s hooks and UI components work on the client.
2. **Sign-in / sign-up** use embedded Clerk components on catch-all routes:
   - `app/sign-in/[[...sign-in]]/page.tsx` — `<SignIn />`
   - `app/sign-up/[[...sign-up]]/page.tsx` — `<SignUp />`
3. **Dashboard** lives under `app/dashboard/` and uses server APIs such as `currentUser()` where needed; the primary enforcement is middleware (see below).

## Clerk Dashboard

In the [Clerk Dashboard](https://dashboard.clerk.com) → your application → **Paths**, align URLs with this app (e.g. sign-in `/sign-in`, sign-up `/sign-up`). Configure **After sign out** there if you want a specific landing page after the user signs out from `UserButton`.

## Environment variables

Copy `.env.example` to `.env.local` and set real values from the Clerk Dashboard (**API Keys**).

| Variable | Scope | Purpose |
| -------- | ----- | ------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client + server | Clerk publishable key |
| `CLERK_SECRET_KEY` | Server only | Clerk secret key — never expose to the browser |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Client | Path to the sign-in page (`/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Client | Path to the sign-up page (`/sign-up`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Client | Default redirect after sign-in (e.g. `/dashboard`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Client | Default redirect after sign-up (e.g. `/dashboard`) |

Production and preview deployments must define the same variables in the host’s environment (e.g. Vercel project settings).

## Middleware and route protection

`middleware.ts` uses **`clerkMiddleware`** from `@clerk/nextjs/server` with Clerk’s recommended **matcher** so static assets and Next internals are skipped.

**Protected routes** are defined with **`createRouteMatcher`**: any path matching `/dashboard(.*)` calls **`auth.protect()`**, which redirects unauthenticated users to sign-in.

All other matched routes (including `/`, `/sign-in`, `/sign-up`) stay public unless you add more patterns to the matcher and the same `auth.protect()` logic.

To protect additional sections (e.g. `/settings`), add them to the array passed to `createRouteMatcher` and keep sign-in/sign-up (and any marketing pages) out of that list unless you intend to require auth there.

## Notes for developers

- **Secrets**: Only `NEXT_PUBLIC_*` variables are safe for client bundles. Treat `CLERK_SECRET_KEY` as confidential in every environment.
- **Extending auth**: Prefer middleware for route-level gates; use `auth()` / `currentUser()` in Server Components or Route Handlers when you need user data or per-request checks.
- **Prefetching**: Links to protected pages from public pages can trigger prefetch errors if the prefetch hits a redirect. For those links, use `prefetch={false}` on `next/link` where applicable.
- **`.env.example`** is tracked in git; `.env.local` is ignored. Do not commit real keys.
