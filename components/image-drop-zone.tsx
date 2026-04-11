"use client";

import { createClient } from "@/lib/supabase/client";
import { uploadPublicImage } from "@/lib/supabase/upload-public-image";
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
  /** Supabase Storage bucket id (bucket should be public for the returned URL to work). */
  bucket: string;
  /** Optional path prefix inside the bucket, e.g. `avatars`. */
  folder?: string;
  /** Called with the public URL after a successful upload. */
  onUploadComplete: (publicUrl: string) => void;
  onError?: (error: Error) => void;
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

export function ImageDropZone({
  bucket,
  folder,
  onUploadComplete,
  onError,
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
      try {
        const supabase = createClient();
        const url = await uploadPublicImage(supabase, bucket, file, { folder });
        onUploadComplete(url);
      } catch (e) {
        const err = e instanceof Error ? e : new Error("Upload failed.");
        onError?.(err);
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, folder, onUploadComplete, onError]
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

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    setIsDragging(true);
  }, []);

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
      const file = firstImageFile(e.dataTransfer.files);
      handleFile(file);
    },
    [handleFile]
  );

  const openPicker = useCallback(() => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  }, [disabled, isUploading]);

  const busy = disabled || isUploading;

  return (
    <div
      className={cn(
        "relative rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors",
        isDragging && !busy && "border-primary bg-accent/40",
        busy && "cursor-not-allowed opacity-60",
        !busy && "cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/50",
        className
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={openPicker}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      role="button"
      tabIndex={busy ? -1 : 0}
      aria-disabled={busy}
      aria-busy={isUploading}
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
      <div className="flex flex-col items-center gap-2">
        {isUploading ? (
          <Loader2 className="size-10 text-muted-foreground animate-spin" aria-hidden />
        ) : (
          <ImageUp className="size-10 text-muted-foreground" aria-hidden />
        )}
        <p className="text-sm font-medium text-foreground">
          {isUploading ? "Uploading…" : "Drop an image here, or click to choose"}
        </p>
        <p className="text-xs text-muted-foreground">One image at a time</p>
      </div>
    </div>
  );
}
