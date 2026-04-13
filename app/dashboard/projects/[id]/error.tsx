"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProjectDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[project detail]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        We couldn&apos;t load this project. Check your connection and try again.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
