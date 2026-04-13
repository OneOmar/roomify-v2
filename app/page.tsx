import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Box, Images, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Images,
    title: "Upload your plan",
    description:
      "Drop a single room photo—no extra setup or templates required.",
  },
  {
    icon: Sparkles,
    title: "AI render",
    description:
      "We generate a photorealistic view while your project saves automatically.",
  },
  {
    icon: Box,
    title: "Compare anytime",
    description:
      "Open side-by-side comparisons for any saved project in your dashboard.",
  },
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[min(100%,56rem)] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12" />
        <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-primary/6 blur-3xl dark:bg-primary/8" />
        <div className="absolute bottom-1/4 left-0 h-64 w-64 -translate-x-1/3 rounded-full bg-accent/40 blur-3xl dark:bg-accent/15" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
          >
            Roomify
          </Link>
          <nav
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Main"
          >
            {userId ? (
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-(--shadow-sm) transition-[box-shadow,transform] duration-200 hover:shadow-(--shadow-md) active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-(--shadow-sm) transition-[box-shadow,transform] duration-200 hover:shadow-(--shadow-md) active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="relative w-full">
        <section
          className="flex w-full min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-12 sm:min-h-[calc(100dvh-4rem)] sm:px-6 sm:py-16"
          aria-label="Hero"
        >
          <div className="mx-auto w-full max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
              AI architectural visualization
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.08]">
              From flat photo to photorealistic space
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Upload a room image and explore AI-generated renders—clearer depth,
              materials, and atmosphere without rebuilding your workflow.
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              {userId ? (
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-(--shadow-sm) transition-[box-shadow,transform] duration-200 hover:shadow-(--shadow-md) active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-initial"
                >
                  Open dashboard
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-(--shadow-sm) transition-[box-shadow,transform] duration-200 hover:shadow-(--shadow-md) active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-initial"
                  >
                    Get started
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground shadow-(--shadow-xs) transition-[background-color,box-shadow] duration-200 hover:bg-muted/50 hover:shadow-(--shadow-sm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-initial"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            {!userId ? (
              <p className="mx-auto mt-6 max-w-lg text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/dashboard"
                  className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm"
                >
                  Open dashboard
                </Link>{" "}
                — you&apos;ll be asked to sign in if needed.
              </p>
            ) : null}
          </div>
        </section>

        <section
          className="flex min-h-dvh w-full flex-col justify-center border-t border-border/45 px-4 py-16 sm:px-6 sm:py-20"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-10 text-center sm:mb-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
                Workflow
              </p>
              <h2
                id="features-heading"
                className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                How it works
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Three steps from upload to a saved, comparable render.
              </p>
            </div>

            <ul className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-3 sm:gap-6 lg:max-w-none">
              {features.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-(--shadow-sm) ring-1 ring-black/2 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-(--shadow-md) dark:bg-card/90 dark:ring-white/5 sm:p-7">
                    <div
                      className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/[0.06] to-transparent opacity-80 dark:from-primary/[0.09]"
                      aria-hidden
                    />
                    <div className="relative flex flex-1 flex-col">
                      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-(--shadow-xs) ring-1 ring-primary/15 transition-[background-color,box-shadow] duration-300 group-hover:bg-primary/[0.14] group-hover:shadow-(--shadow-sm)">
                        <Icon className="size-6" strokeWidth={1.6} aria-hidden />
                      </div>
                      <h2 className="text-base font-semibold tracking-tight text-foreground">
                        {title}
                      </h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="relative flex min-h-dvh w-full flex-col justify-end border-t border-border/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-tight text-foreground">
                Roomify
              </p>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} · Architectural visualization
              </p>
            </div>

            <nav
              className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm"
              aria-label="Footer"
            >
              {!userId ? (
                <>
                  <Link
                    href="/sign-in"
                    className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Sign in
                  </Link>
                  <span
                    className="hidden text-muted-foreground/35 select-none sm:inline"
                    aria-hidden
                  >
                    ·
                  </span>
                  <Link
                    href="/sign-up"
                    className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Create account
                  </Link>
                  <span
                    className="hidden text-muted-foreground/35 select-none sm:inline"
                    aria-hidden
                  >
                    ·
                  </span>
                </>
              ) : null}
              <Link
                href="/dashboard"
                className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
