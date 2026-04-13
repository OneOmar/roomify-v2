"use client";

import { cn } from "@/lib/utils";
import { ImageUp, Loader2 } from "lucide-react";
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";

export type ImageDropZoneProps = {
  /** Path prefix inside the bucket (server uses NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET). */
  folder?: string;
  /** Upload endpoint (default POST /api/upload, Clerk + service role). */
  uploadUrl?: string;
  /** Called with the public URL after a successful upload. If it returns a Promise, it is awaited before clearing the uploading state. */
  onUploadComplete: (publicUrl: string) => void | Promise<void>;
  onError?: (error: Error) => void;
  /** Fired when upload + awaited `onUploadComplete` starts or finishes (for parent loading UI). */
  onBusyChange?: (busy: boolean) => void;
  className?: string;
  disabled?: boolean;
  accept?: string;
};

function firstImageFile(list: FileList | null): File | null {
  if (!list?.length) return null;
  for (let i = 0; i < list.length; i++) {
    const f = list.item(i);
    if (f && f.type.startsWith("image/")) return f;
  }
  return null;
}

async function uploadImageViaApi(
  file: File,
  folder: string | undefined,
  uploadUrl: string
): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  if (folder) body.append("folder", folder);

  const res = await fetch(uploadUrl, { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" && data.error
        ? data.error
        : "Upload failed."
    );
  }
  if (typeof data.url !== "string" || !data.url) {
    throw new Error("Upload succeeded but no URL was returned.");
  }
  return data.url;
}

export function ImageDropZone({
  folder,
  uploadUrl = "/api/upload",
  onUploadComplete,
  onError,
  onBusyChange,
  className,
  disabled = false,
  accept = "image/*",
}: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const runUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      onBusyChange?.(true);
      try {
        const url = await uploadImageViaApi(file, folder, uploadUrl);
        await Promise.resolve(onUploadComplete(url));
      } catch (e) {
        const err = e instanceof Error ? e : new Error("Upload failed.");
        onError?.(err);
      } finally {
        setIsUploading(false);
        onBusyChange?.(false);
      }
    },
    [folder, uploadUrl, onUploadComplete, onError, onBusyChange]
  );

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file || disabled || isUploading) return;
      void runUpload(file);
    },
    [disabled, isUploading, runUpload]
  );

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = firstImageFile(e.target.files);
      handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const onDragEnter = useCallback(
    (e: DragEvent) => {
      if (disabled || isUploading) return;
      e.preventDefault();
      e.stopPropagation();
      dragDepth.current += 1;
      setIsDragging(true);
    },
    [disabled, isUploading]
  );

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepth.current = 0;
      setIsDragging(false);
      if (disabled || isUploading) return;
      const file = firstImageFile(e.dataTransfer.files);
      handleFile(file);
    },
    [disabled, isUploading, handleFile]
  );

  const openPicker = useCallback(() => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  }, [disabled, isUploading]);

  const busy = disabled || isUploading;

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-dashed border-border/90 bg-muted/25 px-6 py-12 text-center shadow-[var(--shadow-xs)] transition-[border-color,background-color,box-shadow,transform] duration-200 sm:px-8 sm:py-14",
        isDragging &&
          !busy &&
          "scale-[1.01] border-primary/50 bg-primary/[0.06] shadow-[var(--shadow-md)] ring-2 ring-primary/20",
        busy && "pointer-events-none cursor-not-allowed opacity-55",
        !busy &&
          !isDragging &&
          "cursor-pointer hover:border-primary/35 hover:bg-muted/45 hover:shadow-[var(--shadow-sm)]",
        className
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={openPicker}
      onKeyDown={(e: KeyboardEvent) => {
        if (busy) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      role="button"
      tabIndex={busy ? -1 : 0}
      aria-disabled={busy}
      aria-busy={busy}
      aria-label="Upload image: drop a file or activate to choose"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        disabled={busy}
        onChange={onInputChange}
      />
      <div className="flex flex-col items-center gap-3">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl bg-background/90 text-muted-foreground shadow-[var(--shadow-xs)] ring-1 ring-border/70 transition-[color,background-color,box-shadow] duration-200",
            !busy && "group-hover:text-primary",
            isDragging && !busy && "bg-primary/10 text-primary ring-primary/25"
          )}
        >
          {busy ? (
            <Loader2 className="size-7 animate-spin text-primary/90" aria-hidden />
          ) : (
            <ImageUp className="size-7" strokeWidth={1.5} aria-hidden />
          )}
        </span>
        <p className="text-sm font-medium text-foreground">
          {busy
            ? disabled && !isUploading
              ? "Unavailable"
              : "Please wait…"
            : "Drop an image here, or click to choose"}
        </p>
        <p className="text-xs text-muted-foreground">One image at a time · JPG, PNG, WebP</p>
      </div>
    </div>
  );
}
