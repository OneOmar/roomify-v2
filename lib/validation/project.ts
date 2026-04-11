const MAX_URL_LENGTH = 2048;

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
  if (!isAllowedAbsoluteUrl(inputUrl)) {
    return {
      ok: false,
      message:
        "input_url must be a valid http(s) URL (https in production; localhost allowed for dev).",
      field: "input_url",
    };
  }

  let outputUrl: string | null = null;
  const outputRaw = record.output_url;
  if (outputRaw !== undefined && outputRaw !== null) {
    if (typeof outputRaw !== "string") {
      return {
        ok: false,
        message: "output_url must be a string or omitted.",
        field: "output_url",
      };
    }
    const trimmed = outputRaw.trim();
    if (trimmed === "") {
      outputUrl = null;
    } else if (!isAllowedAbsoluteUrl(trimmed)) {
      return {
        ok: false,
        message:
          "output_url must be a valid http(s) URL when provided (https in production; localhost allowed for dev).",
        field: "output_url",
      };
    } else {
      outputUrl = trimmed;
    }
  }

  return { ok: true, value: { inputUrl, outputUrl } };
}
