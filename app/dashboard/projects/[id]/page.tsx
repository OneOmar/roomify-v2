import { fetchProjectForUser } from "@/lib/fetch-project-for-user";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Comparison",
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const { id } = await params;
  if (!id?.trim()) {
    notFound();
  }

  let project: Awaited<ReturnType<typeof fetchProjectForUser>>;
  try {
    project = await fetchProjectForUser(id, userId);
  } catch {
    throw new Error("Failed to load project.");
  }

  if (!project) {
    notFound();
  }

  const created = new Date(project.created_at);
  const createdLabel = Number.isNaN(created.getTime())
    ? null
    : created.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to dashboard
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Project
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Comparison
            </h1>
          </div>
          {createdLabel ? (
            <p className="shrink-0 text-sm text-muted-foreground">{createdLabel}</p>
          ) : null}
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Original photo and AI-generated render side by side.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
        <section className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-sm)] ring-1 ring-black/[0.02] dark:ring-white/[0.04] sm:p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Original
          </h2>
          <div className="relative flex-1 min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs */}
            <img
              src={project.input_url}
              alt="Original room photo"
              className="w-full rounded-xl border border-border/70 object-cover aspect-4/3 bg-muted shadow-[var(--shadow-xs)]"
            />
          </div>
        </section>

        <section className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-sm)] ring-1 ring-black/[0.02] dark:ring-white/[0.04] sm:p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI render
          </h2>
          <div className="relative flex-1 min-h-0">
            {project.output_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={project.output_url}
                alt="AI-generated room render"
                className="w-full rounded-xl border border-border/70 object-cover aspect-4/3 bg-muted shadow-[var(--shadow-xs)] ring-1 ring-primary/10"
              />
            ) : (
              <div className="flex aspect-4/3 w-full items-center justify-center rounded-xl border border-dashed border-border/90 bg-muted/30 px-4 text-center text-sm leading-relaxed text-muted-foreground">
                No render saved for this project yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
