import { auth } from "@clerk/nextjs/server";
import { fetchProjectForUser } from "@/lib/fetch-project-for-user";
import { parsePatchProjectOutputBody } from "@/lib/validation/project";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ProjectRow = {
  id: string;
  user_id: string;
  input_url: string;
  output_url: string | null;
  created_at: string;
};

/**
 * GET /api/projects/:id
 * Returns a project owned by the signed-in user.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Invalid project id." }, { status: 400 });
  }

  try {
    const project = await fetchProjectForUser(id, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: project.id,
        input_url: project.input_url,
        output_url: project.output_url,
        created_at: project.created_at,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load project." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/:id
 * Sets output_url for a project owned by the signed-in user.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Invalid project id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = parsePatchProjectOutputBody(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.message, field: parsed.field },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    console.error("[api/projects/:id] Supabase configuration error:", e);
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ output_url: parsed.value.outputUrl })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, user_id, input_url, output_url, created_at")
    .maybeSingle<ProjectRow>();

  if (error) {
    console.error("[api/projects/:id] Supabase update error:", error.message);
    return NextResponse.json(
      { error: "Could not update project." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({
    project: {
      id: data.id,
      user_id: data.user_id,
      input_url: data.input_url,
      output_url: data.output_url,
      created_at: data.created_at,
    },
  });
}
