const MAX_URL_LENGTH = 2048;

function isAllowedAbsoluteUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (value.length > MAX_URL_LENGTH) return false;
    if (u.protocol === "https:") return true;
    const isLocalHost =
      u.hostname === "localhost" || u.hostname === "127.0.0.1";
    if (
      process.env.NODE_ENV !== "production" &&
      u.protocol === "http:" &&
      isLocalHost
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export type GenerateBodyPayload = {
  imageUrl: string;
};

export type ParseGenerateBodyResult =
  | { ok: true; value: GenerateBodyPayload }
  | { ok: false; message: string; field?: string };

/**
 * Validates JSON body for POST /api/generate (camelCase `imageUrl`).
 */
export function parseGenerateBody(body: unknown): ParseGenerateBodyResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const record = body as Record<string, unknown>;
  const raw = record.imageUrl;

  if (typeof raw !== "string") {
    return {
      ok: false,
      message: "imageUrl is required and must be a string.",
      field: "imageUrl",
    };
  }

  const imageUrl = raw.trim();
  if (!imageUrl) {
    return {
      ok: false,
      message: "imageUrl must not be empty.",
      field: "imageUrl",
    };
  }

  if (!isAllowedAbsoluteUrl(imageUrl)) {
    return {
      ok: false,
      message:
        "imageUrl must be an absolute https URL (http on localhost is allowed only outside production).",
      field: "imageUrl",
    };
  }

  return { ok: true, value: { imageUrl } };
}
