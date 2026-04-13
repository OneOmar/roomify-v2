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
      className="w-full aspect-video overflow-hidden rounded-xl border border-border/80 bg-muted/40 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] dark:shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]"
    >
      <div className="h-full w-full animate-pulse bg-gradient-to-br from-muted via-muted/80 to-muted/60" />
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
    <section
      className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-sm)] ring-1 ring-black/[0.02] dark:ring-white/[0.04] sm:p-8"
      aria-labelledby="workspace-heading"
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            New project
          </p>
          <h2
            id="workspace-heading"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Redesign a room
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Upload a photo. We save your project, run generation, then store the
            result.
          </p>
        </div>

        <div className="space-y-4">
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
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 shrink-0 animate-spin text-primary/80" aria-hidden />
              <span>{statusLine}</span>
            </p>
          ) : null}
        </div>

        {error ? (
          <div
            className="rounded-xl border border-destructive/25 bg-destructive/[0.06] px-4 py-3.5 text-sm text-destructive shadow-[var(--shadow-xs)] dark:bg-destructive/[0.1]"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <p className="min-w-0 flex-1 leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="shrink-0 rounded-lg border border-destructive/35 bg-background/80 px-3 py-2 text-xs font-medium text-destructive transition-[background-color,box-shadow] duration-200 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        {showPreviewRow ? (
          <div className="space-y-5 border-t border-border/60 pt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preview
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {inputPreviewUrl ? (
                <figure className="min-w-0 space-y-2.5">
                  <figcaption className="text-xs font-medium text-muted-foreground">
                    Your upload
                  </figcaption>
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase / AI URLs */}
                  <img
                    src={inputPreviewUrl}
                    alt="Uploaded room"
                    className="w-full rounded-xl border border-border/80 object-cover aspect-video bg-muted shadow-[var(--shadow-xs)] transition-[box-shadow,transform] duration-300 hover:shadow-[var(--shadow-md)]"
                  />
                </figure>
              ) : null}

              {outputPreviewUrl ? (
                <figure className="min-w-0 space-y-2.5">
                  <figcaption className="text-xs font-medium text-muted-foreground">
                    Generated
                  </figcaption>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={outputPreviewUrl}
                    alt="Generated room"
                    className="w-full rounded-xl border border-border/80 object-cover aspect-video bg-muted shadow-[var(--shadow-xs)] ring-1 ring-primary/10 transition-[box-shadow,transform] duration-300 hover:shadow-[var(--shadow-md)]"
                  />
                </figure>
              ) : inputPreviewUrl ? (
                <figure className="min-w-0 space-y-2.5">
                  <figcaption className="text-xs font-medium text-muted-foreground">
                    Generated
                  </figcaption>
                  {sessionBusy ? (
                    <GeneratedPreviewSkeleton />
                  ) : error ? (
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border/90 bg-muted/25 px-4 text-center text-sm text-muted-foreground">
                      Preview unavailable.
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border/90 bg-muted/35 px-4 text-center text-sm text-muted-foreground">
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
                  className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
                >
                  Open full comparison
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
