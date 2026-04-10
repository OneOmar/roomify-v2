# Roomify

Roomify is a Next.js web application with authentication powered by Clerk. Authenticated users access a protected dashboard; the rest of the app remains publicly reachable unless you extend middleware.

## Tech stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| Framework    | Next.js 15 (App Router), Turbopack          |
| UI           | React 19, Tailwind CSS 4, shadcn/ui patterns |
| Components   | Base UI, Lucide icons                       |
| Auth         | [Clerk](https://clerk.com) (`@clerk/nextjs` v7) |
| Language     | TypeScript                                  |

## Documentation

- **[Clerk authentication](docs/clerk-setup.md)** — installation, environment variables, middleware, route protection, and developer notes.

## Run locally

Prerequisites: **Node.js** (LTS recommended) and **npm**.

```bash
npm install
```

Copy `.env.example` to `.env.local` (e.g. `copy .env.example .env.local` on Windows, or `cp .env.example .env.local` on macOS/Linux), then add your Clerk keys. See [docs/clerk-setup.md](docs/clerk-setup.md) for the full variable list.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Visiting `/dashboard` while signed out should redirect you through Clerk’s sign-in flow.

Other scripts:

- **`npm run build`** — production build (requires valid Clerk env vars)
- **`npm run start`** — serve the production build
- **`npm run lint`** — ESLint
