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
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          {user
            ? "You are signed in. This area is only available to authenticated users."
            : "We couldn't verify your session. Please refresh or sign in again."}
        </p>
      </div>

      {user ? (
        <>
          <DashboardRoomWorkspace />
          <RecentProjects projects={recentProjects} />
        </>
      ) : null}
    </div>
  );
}
