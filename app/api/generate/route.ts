import { auth } from "@clerk/nextjs/server";
import { createImageGenerationProvider } from "@/lib/ai/image-generation";
import { HuggingFaceInferenceError } from "@/lib/ai/huggingface-stable-diffusion";
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
    if (e instanceof HuggingFaceInferenceError) {
      let status = 502;
      if (e.modelLoadingEstimateSeconds != null) {
        status = 503;
      } else if (
        e.status != null &&
        e.status >= 400 &&
        e.status < 600
      ) {
        status = e.status;
      }
      const headers =
        e.modelLoadingEstimateSeconds != null
          ? {
              RetryAfter: String(
                Math.min(120, Math.ceil(e.modelLoadingEstimateSeconds))
              ),
            }
          : undefined;
      return NextResponse.json({ error: e.message }, { status, headers });
    }
    return NextResponse.json(
      { error: "Image generation failed." },
      { status: 500 }
    );
  }
}
