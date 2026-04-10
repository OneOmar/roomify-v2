import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">
        Welcome{user?.firstName ? `, ${user.firstName}` : ""}
      </h1>
      <p className="text-muted-foreground text-sm">
        You are signed in. This area is only available to authenticated users.
      </p>
    </div>
  );
}
