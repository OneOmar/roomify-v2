import type { UserProject } from "@/lib/fetch-project-for-user";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type RecentProjectsProps = {
  projects: UserProject[];
};

function formatProjectTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function previewUrl(project: UserProject): string {
  return project.output_url ?? project.input_url;
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <section className="space-y-6" aria-labelledby="recent-projects-heading">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="recent-projects-heading"
          className="text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Recent projects
        </h2>
        {projects.length > 0 ? (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {projects.length} saved
          </p>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/90 bg-muted/20 px-6 py-12 text-center shadow-[var(--shadow-xs)] sm:px-8">
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            No projects yet. Upload a room photo above to create your first one.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {projects.map((project) => {
            const thumb = previewUrl(project);
            const dateLabel = formatProjectTimestamp(project.created_at);

            return (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-left shadow-[var(--shadow-sm)] ring-1 ring-black/[0.02] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:ring-white/[0.04]"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs */}
                    <img
                      src={thumb}
                      alt="Room preview"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {!project.output_url ? (
                      <span className="absolute bottom-2.5 left-2.5 rounded-md bg-background/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shadow-[var(--shadow-xs)] backdrop-blur-sm">
                        No render yet
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="block truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        Open comparison
                      </span>
                      {dateLabel ? (
                        <span className="block text-xs text-muted-foreground">{dateLabel}</span>
                      ) : null}
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
