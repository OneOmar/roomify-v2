import { UserButton } from "@clerk/nextjs";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh flex flex-col bg-background">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-30"
        aria-hidden
      >
        <div className="absolute left-0 top-0 h-[32rem] w-[32rem] -translate-x-1/3 -translate-y-1/4 rounded-full bg-primary/[0.06] blur-3xl dark:bg-primary/[0.1]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2.5 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 transition-[background-color,box-shadow] duration-200 group-hover:bg-primary/[0.14] group-hover:shadow-[var(--shadow-xs)]">
              <LayoutGrid className="size-[18px]" strokeWidth={2} aria-hidden />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Roomify
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Studio
              </span>
            </span>
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-9 ring-2 ring-border/60 shadow-[var(--shadow-xs)]",
              },
            }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
