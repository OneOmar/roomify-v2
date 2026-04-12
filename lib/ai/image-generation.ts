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

export function createImageGenerationProvider(): ImageGenerationProvider {
  const mode = process.env.AI_IMAGE_PROVIDER?.trim().toLowerCase() ?? "fake";

  switch (mode) {
    case "fake":
      return new FakeImageGenerationProvider();
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
