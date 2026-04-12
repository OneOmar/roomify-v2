import { createImageGenerationProvider } from "@/lib/ai/image-generation";
import { parseGenerateBody } from "@/lib/validation/generate";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/generate
 * Body: { imageUrl: string }
 * Response: { generatedImageUrl: string }
 */
export async function POST(request: Request) {
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
