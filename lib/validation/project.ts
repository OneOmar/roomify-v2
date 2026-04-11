const MAX_URL_LENGTH = 2048;

/** Supabase public bucket object URLs use this path prefix. */
const PUBLIC_STORAGE_OBJECT_PREFIX = "/storage/v1/object/public/";

function isAllowedAbsoluteUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (value.length > MAX_URL_LENGTH) return false;
    if (u.protocol === "https:") return true;
    if (
      u.protocol === "http:" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1")
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function trustedSupabaseOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

/**
 * True when the URL is a public object URL on this project's Supabase instance
 * (same origin as NEXT_PUBLIC_SUPABASE_URL and standard Storage path).
 */
function isTrustedProjectStorageUrl(value: string): boolean {
  if (!isAllowedAbsoluteUrl(value)) return false;
  const origin = trustedSupabaseOrigin();
  if (!origin) return false;
  try {
    const u = new URL(value);
    if (u.origin !== origin) return false;
    return u.pathname.startsWith(PUBLIC_STORAGE_OBJECT_PREFIX);
  } catch {
    return false;
  }
}

export type CreateProjectPayload = {
  inputUrl: string;
  outputUrl: string | null;
};

export type ParseCreateProjectResult =
  | { ok: true; value: CreateProjectPayload }
  | { ok: false; message: string; field?: string };

/**
 * Validates a JSON body for creating a project row (after upload).
 * Expects snake_case keys to match the API contract and DB columns.
 */
export function parseCreateProjectBody(body: unknown): ParseCreateProjectResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const record = body as Record<string, unknown>;

  const inputRaw = record.input_url;
  if (typeof inputRaw !== "string") {
    return {
      ok: false,
      message: "input_url is required and must be a string.",
      field: "input_url",
    };
  }
  const inputUrl = inputRaw.trim();
  if (!inputUrl) {
    return {
      ok: false,
      message: "input_url must not be empty.",
      field: "input_url",
    };
  }
  if (!isTrustedProjectStorageUrl(inputUrl)) {
    return {
      ok: false,
      message:
        "input_url must be a public Supabase Storage URL for this project (not an arbitrary https link).",
      field: "input_url",
    };
  }

  let outputUrl: string | null = null;
  const outputRaw = record.output_url;
  if (outputRaw !== undefined && outputRaw !== null) {
    if (typeof outputRaw !== "string") {
      return {
        ok: false,
        message: "output_url must be a string, null, or omitted.",
        field: "output_url",
      };
    }
    const trimmed = outputRaw.trim();
    if (trimmed === "") {
      outputUrl = null;
    } else if (!isTrustedProjectStorageUrl(trimmed)) {
      return {
        ok: false,
        message:
          "output_url must be a public Supabase Storage URL for this project when provided.",
        field: "output_url",
      };
    } else {
      outputUrl = trimmed;
    }
  }

  return { ok: true, value: { inputUrl, outputUrl } };
}
