import { auth } from "@clerk/nextjs/server";
import { uploadPublicImage } from "@/lib/supabase/upload-public-image";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/upload
 * Multipart form: `file` (image), optional `folder` (path prefix inside bucket).
 * Requires Clerk session. Uses service role so Storage RLS does not apply.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data with a file field." },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const entry = formData.get("file");
  if (!entry || typeof entry === "string") {
    return NextResponse.json(
      { error: "Missing image file (form field: file)." },
      { status: 400 }
    );
  }

  const file = entry as File;
  if (!file.size) {
    return NextResponse.json({ error: "Empty file." }, { status: 400 });
  }

  const folderRaw = formData.get("folder");
  const folder =
    typeof folderRaw === "string" && folderRaw.trim()
      ? folderRaw.trim().replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/")
      : undefined;

  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET?.trim() ?? "uploads";

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    console.error("[api/upload] Supabase configuration error:", e);
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  try {
    const url = await uploadPublicImage(supabase, bucket, file, { folder });
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    console.error("[api/upload] Storage error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
