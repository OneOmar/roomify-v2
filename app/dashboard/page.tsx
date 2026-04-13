import { DashboardRoomWorkspace } from "@/components/dashboard-room-workspace";
import { RecentProjects } from "@/components/recent-projects";
import { fetchRecentProjectsForUser } from "@/lib/fetch-project-for-user";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  let recentProjects: Awaited<ReturnType<typeof fetchRecentProjectsForUser>> = [];
  if (user?.id) {
    try {
      recentProjects = await fetchRecentProjectsForUser(user.id);
    } catch (e) {
      console.error("[dashboard] Could not load recent projects:", e);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-12 lg:max-w-5xl lg:space-y-14">
      <header className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {user
            ? "Upload a room image to generate a render. Projects save automatically so you can compare anytime."
            : "We couldn't verify your session. Please refresh or sign in again."}
        </p>
      </header>

      {user ? (
        <div className="space-y-14 lg:space-y-16">
          <DashboardRoomWorkspace />
          <RecentProjects projects={recentProjects} />
        </div>
      ) : null}
    </div>
  );
}
