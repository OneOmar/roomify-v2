"use client";

import { ImageDropZone } from "@/components/image-drop-zone";
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

export type DashboardRoomWorkspaceProps = {
  uploadFolder?: string;
};

export function DashboardRoomWorkspace({
  uploadFolder = "inputs",
}: DashboardRoomWorkspaceProps) {
  const [pipelineBusy, setPipelineBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputPreviewUrl, setInputPreviewUrl] = useState<string | null>(null);
  const [outputPreviewUrl, setOutputPreviewUrl] = useState<string | null>(null);

  const onUploadComplete = useCallback(async (inputUrl: string) => {
    setError(null);
    setOutputPreviewUrl(null);
    setInputPreviewUrl(inputUrl);
    setPipelineBusy(true);

    try {
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

      const patchRes = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ output_url: generatedImageUrl }),
      });
      if (!patchRes.ok) {
        throw new Error(await readErrorMessage(patchRes));
      }

      setOutputPreviewUrl(generatedImageUrl);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(message);
      setOutputPreviewUrl(null);
    } finally {
      setPipelineBusy(false);
    }
  }, []);

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

      <ImageDropZone
        folder={uploadFolder}
        onUploadComplete={onUploadComplete}
        onError={(err) => setError(err.message)}
        disabled={pipelineBusy}
      />

      {error ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {inputPreviewUrl || outputPreviewUrl ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {inputPreviewUrl ? (
            <figure className="space-y-2">
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
            <figure className="space-y-2">
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
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
