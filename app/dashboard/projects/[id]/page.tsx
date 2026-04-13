import { fetchProjectForUser } from "@/lib/fetch-project-for-user";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Comparison · Roomify",
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
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-2">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to dashboard
        </Link>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Comparison</h1>
          {createdLabel ? (
            <p className="text-sm text-muted-foreground shrink-0">{createdLabel}</p>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Original photo and AI-generated render side by side.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
        <section className="flex flex-col rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
            Original
          </h2>
          <div className="relative flex-1 min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs */}
            <img
              src={project.input_url}
              alt="Original room photo"
              className="w-full rounded-lg border border-border object-cover aspect-4/3 bg-muted"
            />
          </div>
        </section>

        <section className="flex flex-col rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
            AI render
          </h2>
          <div className="relative flex-1 min-h-0">
            {project.output_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={project.output_url}
                alt="AI-generated room render"
                className="w-full rounded-lg border border-border object-cover aspect-4/3 bg-muted"
              />
            ) : (
              <div className="flex aspect-4/3 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-muted-foreground">
                No render saved for this project yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
