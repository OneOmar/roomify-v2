const DEFAULT_HF_MODEL_ID = "stabilityai/stable-diffusion-2-1";

const BASE_ROOM_PROMPT = "Convert this 2D floor plan into a photorealistic top-down 3D architectural render. Realistic lighting, natural materials, ultra detailed, 4K."


export class HuggingFaceInferenceError extends Error {
  readonly status: number | undefined;
  readonly modelLoadingEstimateSeconds: number | undefined;

  constructor(
    message: string,
    options?: { status?: number; modelLoadingEstimateSeconds?: number }
  ) {
    super(message);
    this.name = "HuggingFaceInferenceError";
    this.status = options?.status;
    this.modelLoadingEstimateSeconds = options?.modelLoadingEstimateSeconds;
  }
}

function resolveModelIds(): string[] {
  const primary = process.env.HF_MODEL_ID?.trim() || DEFAULT_HF_MODEL_ID;
  const rawFallback = process.env.HF_FALLBACK_MODEL_IDS?.trim() || "";
  const fallback = rawFallback
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of [primary, ...fallback]) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function inferenceUrlsForModel(modelId: string): readonly string[] {
  return [
    `https://api-inference.huggingface.co/models/${modelId}`,
    `https://router.huggingface.co/hf-inference/models/${modelId}`,
  ] as const;
}

/**
 * Builds the fixed server-side prompt sent to Stable Diffusion.
 */
export function buildStableDiffusionRoomPrompt(): string {
  return BASE_ROOM_PROMPT;
}

function parseJsonFromBuffer(buffer: ArrayBuffer): unknown {
  try {
    return JSON.parse(new TextDecoder().decode(buffer));
  } catch {
    return null;
  }
}

function textFromBuffer(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder().decode(buffer).trim();
  } catch {
    return "";
  }
}

function errorMessageFromJson(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const err = (json as Record<string, unknown>).error;
  if (typeof err === "string" && err.trim()) return err.trim();
  return null;
}

function isModelUnsupportedByProvider(status: number, message: string | null): boolean {
  if (status !== 400 || !message) return false;
  return /model not supported by provider/i.test(message);
}

/**
 * Calls Hugging Face Inference API for `stabilityai/stable-diffusion-2-1` (text-to-image).
 */
export async function fetchStableDiffusion21Image(
  fullPrompt: string,
  token: string
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const modelIds = resolveModelIds();

  let lastStatus: number | undefined;
  let lastMessage: string | undefined;
  let lastEstimated: number | undefined;
  let sawModelUnavailable = false;

  for (const modelId of modelIds) {
    for (const url of inferenceUrlsForModel(modelId)) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            negative_prompt:
              "ugly, blurry, low quality, distorted, watermark, text, logo, deformed furniture, cluttered",
          },
        }),
      });

      const buffer = await response.arrayBuffer();
      const rawType = response.headers.get("content-type") ?? "";
      const contentType = rawType.split(";")[0].trim().toLowerCase();
      const json = parseJsonFromBuffer(buffer);
      const hfMessage = errorMessageFromJson(json);
      const fallbackText = textFromBuffer(buffer);
      const combinedMessage =
        hfMessage || fallbackText || `Hugging Face request failed (${response.status}).`;

      lastStatus = response.status;
      lastMessage = combinedMessage;

      let estimated: number | undefined;
      if (json && typeof json === "object" && "estimated_time" in json) {
        const v = (json as Record<string, unknown>).estimated_time;
        if (typeof v === "number" && Number.isFinite(v)) estimated = v;
      }
      lastEstimated = estimated;

      if (response.ok) {
        if (contentType.includes("application/json")) {
          const errMsg = errorMessageFromJson(json);
          throw new HuggingFaceInferenceError(
            errMsg || "Unexpected JSON response from image model.",
            { status: 502 }
          );
        }

        const bytes = new Uint8Array(buffer);
        if (!bytes.byteLength) {
          throw new HuggingFaceInferenceError("Empty image response from model.", {
            status: 502,
          });
        }

        return {
          bytes,
          contentType: contentType.startsWith("image/") ? contentType : "image/png",
        };
      }

      const loading =
        response.status === 503 &&
        typeof hfMessage === "string" &&
        hfMessage.toLowerCase().includes("loading");
      if (loading) {
        throw new HuggingFaceInferenceError(
          "The image model is starting up. Please try again in a few seconds.",
          { status: 503, modelLoadingEstimateSeconds: estimated }
        );
      }

      // Try the next endpoint/model when this one is unavailable on serverless inference.
      if (response.status === 404 || isModelUnsupportedByProvider(response.status, hfMessage)) {
        sawModelUnavailable = true;
        continue;
      }

      if (response.status === 401 || response.status === 403) {
        throw new HuggingFaceInferenceError(
          "Image generation could not be authorized. Check HF_TOKEN (User Access Token).",
          { status: response.status }
        );
      }

      throw new HuggingFaceInferenceError(combinedMessage, { status: response.status });
    }
  }

  if (sawModelUnavailable) {
    throw new HuggingFaceInferenceError(
      `Configured Hugging Face model(s) are unavailable on serverless inference (${modelIds.join(
        ", "
      )}). Set HF_MODEL_ID (and optional HF_FALLBACK_MODEL_IDS) to supported text-to-image model IDs.`,
      { status: lastStatus ?? 400, modelLoadingEstimateSeconds: lastEstimated }
    );
  }

  throw new HuggingFaceInferenceError(
    lastMessage || "No response from Hugging Face API.",
    { status: lastStatus ?? 502, modelLoadingEstimateSeconds: lastEstimated }
  );
}
