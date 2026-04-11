import { auth } from "@clerk/nextjs/server";
import { parseCreateProjectBody } from "@/lib/validation/project";
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
 * POST /api/projects
 * Creates a project for the signed-in user after an upload (input_url = uploaded asset).
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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

  const parsed = parseCreateProjectBody(body);
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
    console.error("[api/projects] Supabase configuration error:", e);
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      input_url: parsed.value.inputUrl,
      output_url: parsed.value.outputUrl,
    })
    .select("id, user_id, input_url, output_url, created_at")
    .single<ProjectRow>();

  if (error) {
    console.error("[api/projects] Supabase insert error:", error.message);
    return NextResponse.json(
      { error: "Could not save project." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      project: {
        id: data.id,
        user_id: data.user_id,
        input_url: data.input_url,
        output_url: data.output_url,
        created_at: data.created_at,
      },
    },
    { status: 201 }
  );
}
