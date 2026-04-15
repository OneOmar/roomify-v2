import type { SupabaseClient } from "@supabase/supabase-js";

const IMAGE_TYPE = /^image\//;

/** Maximum image size for public uploads (10 MiB). */
export const MAX_PUBLIC_IMAGE_SIZE = 10 * 1024 * 1024;

/** Max multipart request body before parsing (file limit + boundary / field overhead). */
export const MAX_MULTIPART_UPLOAD_BYTES = MAX_PUBLIC_IMAGE_SIZE + 512 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

function extensionFromImageMime(mime: string): string {
  const key = mime.split(";")[0].trim().toLowerCase();
  return MIME_TO_EXT[key] ?? "png";
}

function fileExtension(file: File): string {
  const mime = file.type;
  if (mime && MIME_TO_EXT[mime]) return MIME_TO_EXT[mime];
  const match = file.name.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? "jpg";
}

function objectPath(file: File, folder?: string): string {
  const safeFolder = folder?.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
  const name = `${crypto.randomUUID()}.${fileExtension(file)}`;
  return safeFolder ? `${safeFolder}/${name}` : name;
}

/**
 * Uploads an image to a Supabase Storage bucket and returns its public URL.
 * The bucket must be public (or use a signed URL flow elsewhere).
 * Rejects files larger than {@link MAX_PUBLIC_IMAGE_SIZE}.
 */
export async function uploadPublicImage(
  supabase: SupabaseClient,
  bucket: string,
  file: File,
  options?: { folder?: string }
): Promise<string> {
  if (!IMAGE_TYPE.test(file.type)) {
    throw new Error("Only image files are allowed.");
  }

  if (file.size > MAX_PUBLIC_IMAGE_SIZE) {
    throw new Error("File exceeds maximum allowed size.");
  }

  const path = objectPath(file, options?.folder);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    const raw = error.message ?? "Upload failed.";
    const code =
      typeof (error as { statusCode?: string }).statusCode === "string"
        ? (error as { statusCode: string }).statusCode
        : undefined;
    const isBucketMissing =
      raw.includes("Bucket not found") ||
      (code === "404" && /bucket/i.test(raw));

    if (isBucketMissing) {
      throw new Error(
        `Storage bucket "${bucket}" was not found. In the Supabase Dashboard open Storage → New bucket, create a bucket with this exact id (or rename your env to match an existing bucket). For public read URLs, enable "Public bucket". Set NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET in .env.local if you use a different name.`
      );
    }
    throw new Error(raw);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function bytesObjectPath(contentType: string, folder?: string): string {
  const safeFolder = folder?.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
  const ext = extensionFromImageMime(contentType);
  const name = `${crypto.randomUUID()}.${ext}`;
  return safeFolder ? `${safeFolder}/${name}` : name;
}

/**
 * Uploads raw image bytes (e.g. from an AI provider) and returns the public URL.
 */
export async function uploadPublicImageBytes(
  supabase: SupabaseClient,
  bucket: string,
  bytes: Uint8Array,
  contentType: string,
  options?: { folder?: string }
): Promise<string> {
  const normalizedType = contentType.split(";")[0].trim().toLowerCase();
  if (!IMAGE_TYPE.test(normalizedType)) {
    throw new Error("Only image content types are allowed.");
  }

  if (bytes.byteLength > MAX_PUBLIC_IMAGE_SIZE) {
    throw new Error("File exceeds maximum allowed size.");
  }

  const path = bytesObjectPath(normalizedType, options?.folder);
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

  const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
    cacheControl: "3600",
    contentType: normalizedType,
    upsert: false,
  });

  if (error) {
    const raw = error.message ?? "Upload failed.";
    const code =
      typeof (error as { statusCode?: string }).statusCode === "string"
        ? (error as { statusCode: string }).statusCode
        : undefined;
    const isBucketMissing =
      raw.includes("Bucket not found") ||
      (code === "404" && /bucket/i.test(raw));

    if (isBucketMissing) {
      throw new Error(
        `Storage bucket "${bucket}" was not found. In the Supabase Dashboard open Storage → New bucket, create a bucket with this exact id (or rename your env to match an existing bucket). For public read URLs, enable "Public bucket". Set NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET in .env.local if you use a different name.`
      );
    }
    throw new Error(raw);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
