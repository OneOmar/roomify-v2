import type { SupabaseClient } from "@supabase/supabase-js";

const IMAGE_TYPE = /^image\//;

/** Maximum image size for public uploads (10 MiB). */
export const MAX_PUBLIC_IMAGE_SIZE = 10 * 1024 * 1024;

function fileExtension(file: File): string {
  const mime = file.type;
  const fromMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/avif": "avif",
  };
  if (mime && fromMime[mime]) return fromMime[mime];
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
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
