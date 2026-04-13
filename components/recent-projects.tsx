import type { UserProject } from "@/lib/fetch-project-for-user";
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
    <section className="space-y-4" aria-labelledby="recent-projects-heading">
      <h2
        id="recent-projects-heading"
        className="text-lg font-semibold tracking-tight"
      >
        Recent projects
      </h2>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No projects yet. Upload a room photo above to create your first one.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const thumb = previewUrl(project);
            const dateLabel = formatProjectTimestamp(project.created_at);

            return (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative aspect-video w-full bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs */}
                    <img
                      src={thumb}
                      alt="Room preview"
                      className="h-full w-full object-cover"
                    />
                    {!project.output_url ? (
                      <span className="absolute bottom-2 left-2 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                        No render yet
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-0.5 p-3">
                    <span className="text-sm font-medium text-foreground group-hover:underline group-hover:underline-offset-4">
                      Open comparison
                    </span>
                    {dateLabel ? (
                      <span className="text-xs text-muted-foreground">{dateLabel}</span>
                    ) : null}
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
