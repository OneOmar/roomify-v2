import { auth } from "@clerk/nextjs/server";
import { createImageGenerationProvider } from "@/lib/ai/image-generation";
import { parseGenerateBody } from "@/lib/validation/generate";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/generate
 * Requires a signed-in user (Clerk). Same auth pattern as POST /api/projects.
 * Body: { imageUrl: string }
 * Response: { generatedImageUrl: string }
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

  const parsed = parseGenerateBody(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.message, field: parsed.field },
      { status: 400 }
    );
  }

  try {
    const provider = createImageGenerationProvider();
    const { generatedImageUrl } = await provider.generate({
      imageUrl: parsed.value.imageUrl,
    });
    return NextResponse.json({ generatedImageUrl });
  } catch (e) {
    console.error("[api/generate] Image generation failed:", e);
    return NextResponse.json(
      { error: "Image generation failed." },
      { status: 500 }
    );
  }
}
