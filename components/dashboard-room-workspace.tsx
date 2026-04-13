"use client";

import { ImageDropZone } from "@/components/image-drop-zone";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type ProjectPayload = {
  id: string;
  input_url: string;
  output_url: string | null;
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data.error === "string" && data.error) return data.error;
  } catch {
    /* ignore */
  }
  return "Something went wrong. Please try again.";
}

function GeneratedPreviewSkeleton() {
  return (
    <div
      role="status"
      aria-label="Generating preview"
      className="w-full aspect-video rounded-lg border border-border bg-muted/50"
    >
      <div className="h-full w-full animate-pulse rounded-[calc(var(--radius-lg)-2px)] bg-muted" />
    </div>
  );
}

export type DashboardRoomWorkspaceProps = {
  uploadFolder?: string;
};

export function DashboardRoomWorkspace({
  uploadFolder = "inputs",
}: DashboardRoomWorkspaceProps) {
  const router = useRouter();
  const [sessionBusy, setSessionBusy] = useState(false);
  const [stepLabel, setStepLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputPreviewUrl, setInputPreviewUrl] = useState<string | null>(null);
  const [outputPreviewUrl, setOutputPreviewUrl] = useState<string | null>(null);
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);

  const onUploadComplete = useCallback(async (inputUrl: string) => {
    setError(null);
    setOutputPreviewUrl(null);
    setLastProjectId(null);
    setInputPreviewUrl(inputUrl);

    try {
      setStepLabel("Saving project…");
      const createRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_url: inputUrl,
          output_url: null,
        }),
      });
      if (!createRes.ok) {
        throw new Error(await readErrorMessage(createRes));
      }
      const createJson = (await createRes.json()) as { project: ProjectPayload };
      const projectId = createJson.project.id;

      setStepLabel("Generating your room…");
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: inputUrl }),
      });
      if (!genRes.ok) {
        throw new Error(await readErrorMessage(genRes));
      }
      const genJson = (await genRes.json()) as { generatedImageUrl: string };
      const generatedImageUrl = genJson.generatedImageUrl;

      setStepLabel("Saving result…");
      const patchRes = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ output_url: generatedImageUrl }),
      });
      if (!patchRes.ok) {
        throw new Error(await readErrorMessage(patchRes));
      }

      setOutputPreviewUrl(generatedImageUrl);
      setLastProjectId(projectId);
      router.refresh();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(message);
      setOutputPreviewUrl(null);
    } finally {
      setStepLabel(null);
    }
  }, [router]);

  const statusLine =
    sessionBusy && stepLabel ? stepLabel : sessionBusy ? "Uploading…" : null;

  const showPreviewRow = Boolean(inputPreviewUrl || outputPreviewUrl);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">
          Redesign a room
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload a photo. We save your project, run generation, then store the result.
        </p>
      </div>

      <div className="space-y-3">
        <ImageDropZone
          folder={uploadFolder}
          onUploadComplete={onUploadComplete}
          onError={(err) => {
            setError(err.message);
            setStepLabel(null);
          }}
          onBusyChange={setSessionBusy}
        />
        {statusLine ? (
          <p
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            <span>{statusLine}</span>
          </p>
        ) : null}
      </div>

      {error ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <p className="min-w-0 flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 rounded-md border border-destructive/40 bg-background px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {showPreviewRow ? (
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            {inputPreviewUrl ? (
              <figure className="space-y-2 min-w-0">
                <figcaption className="text-xs font-medium text-muted-foreground">
                  Your upload
                </figcaption>
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase / AI URLs */}
                <img
                  src={inputPreviewUrl}
                  alt="Uploaded room"
                  className="w-full rounded-lg border border-border object-cover aspect-video bg-muted"
                />
              </figure>
            ) : null}

            {outputPreviewUrl ? (
              <figure className="space-y-2 min-w-0">
                <figcaption className="text-xs font-medium text-muted-foreground">
                  Generated
                </figcaption>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={outputPreviewUrl}
                  alt="Generated room"
                  className="w-full rounded-lg border border-border object-cover aspect-video bg-muted"
                />
              </figure>
            ) : inputPreviewUrl ? (
              <figure className="space-y-2 min-w-0">
                <figcaption className="text-xs font-medium text-muted-foreground">
                  Generated
                </figcaption>
                {sessionBusy ? (
                  <GeneratedPreviewSkeleton />
                ) : error ? (
                  <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 text-center text-sm text-muted-foreground">
                    Preview unavailable.
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-muted-foreground">
                    No render yet.
                  </div>
                )}
              </figure>
            ) : null}
          </div>
          {lastProjectId && outputPreviewUrl ? (
            <p className="text-sm">
              <Link
                href={`/dashboard/projects/${lastProjectId}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Open full comparison
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
