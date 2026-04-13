import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type UserProject = {
  id: string;
  input_url: string;
  output_url: string | null;
  created_at: string;
};

export const DEFAULT_RECENT_PROJECTS_LIMIT = 6;

/**
 * Latest projects for the user, newest first. Server-only.
 */
export async function fetchRecentProjectsForUser(
  userId: string,
  limit: number = DEFAULT_RECENT_PROJECTS_LIMIT
): Promise<UserProject[]> {
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    console.error("[fetchRecentProjectsForUser] Supabase configuration error:", e);
    throw new Error("Server configuration error.");
  }

  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 24);

  const { data, error } = await supabase
    .from("projects")
    .select("id, input_url, output_url, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error("[fetchRecentProjectsForUser] Supabase error:", error.message);
    throw new Error("Could not load projects.");
  }

  return data ?? [];
}

/**
 * Loads a project row for the given Clerk user. Server-only.
 */
export async function fetchProjectForUser(
  projectId: string,
  userId: string
): Promise<UserProject | null> {
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    console.error("[fetchProjectForUser] Supabase configuration error:", e);
    throw new Error("Server configuration error.");
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, input_url, output_url, created_at")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle<UserProject>();

  if (error) {
    console.error("[fetchProjectForUser] Supabase error:", error.message);
    throw new Error("Could not load project.");
  }

  return data;
}
