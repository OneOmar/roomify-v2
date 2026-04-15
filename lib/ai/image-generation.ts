import {
  buildStableDiffusionRoomPrompt,
  fetchStableDiffusion21Image,
} from "@/lib/ai/huggingface-stable-diffusion";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { uploadPublicImageBytes } from "@/lib/supabase/upload-public-image";

export type GenerateImageInput = {
  imageUrl: string;
};

export type GenerateImageOutput = {
  generatedImageUrl: string;
};

/**
 * Pluggable image generation (e.g. room redesign from a photo).
 * Add new implementations and select via AI_IMAGE_PROVIDER.
 */
export interface ImageGenerationProvider {
  generate(input: GenerateImageInput): Promise<GenerateImageOutput>;
}

/**
 * No external API: returns the input URL as the "generated" result.
 * Replace with a real provider when keys and billing are ready.
 */
export class FakeImageGenerationProvider implements ImageGenerationProvider {
  async generate(input: GenerateImageInput): Promise<GenerateImageOutput> {
    return { generatedImageUrl: input.imageUrl };
  }
}

export class HuggingFaceImageGenerationProvider implements ImageGenerationProvider {
  async generate(input: GenerateImageInput): Promise<GenerateImageOutput> {
    void input.imageUrl;

    const token = process.env.HF_TOKEN?.trim();
    if (!token) {
      throw new Error("HF_TOKEN is not configured.");
    }

    const fullPrompt = buildStableDiffusionRoomPrompt();
    const { bytes, contentType } = await fetchStableDiffusion21Image(
      fullPrompt,
      token
    );

    let supabase;
    try {
      supabase = createServiceRoleClient();
    } catch (e) {
      console.error("[ai] Supabase configuration error:", e);
      throw new Error("Storage is not configured.");
    }

    const bucket =
      process.env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET?.trim() ?? "uploads";

    const generatedImageUrl = await uploadPublicImageBytes(
      supabase,
      bucket,
      bytes,
      contentType,
      { folder: "generated" }
    );

    return { generatedImageUrl };
  }
}

export function createImageGenerationProvider(): ImageGenerationProvider {
  const mode = process.env.AI_IMAGE_PROVIDER?.trim().toLowerCase() ?? "fake";

  switch (mode) {
    case "fake":
      return new FakeImageGenerationProvider();
    case "huggingface":
      return new HuggingFaceImageGenerationProvider();
    default:
      if (process.env.NODE_ENV === "production") {
        throw new Error(`[ai] Unknown AI_IMAGE_PROVIDER "${mode}".`);
      }
      console.warn(
        `[ai] Unknown AI_IMAGE_PROVIDER "${mode}", using fake provider.`
      );
      return new FakeImageGenerationProvider();
  }
}
