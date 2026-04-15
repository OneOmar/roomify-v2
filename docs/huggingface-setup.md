# Hugging Face image generation setup

This document describes how Hugging Face image generation is integrated in Roomify (Next.js 15 App Router), including environment configuration, runtime flow, and operational troubleshooting.

## Overview

Roomify supports pluggable image generation providers via `lib/ai/image-generation.ts`:

- **`fake`** (default): returns the original uploaded URL (no external API call).
- **`huggingface`**: calls Hugging Face Inference API with `stabilityai/stable-diffusion-2-1`, uploads the generated image to Supabase Storage, then returns a public URL.

`POST /api/generate` accepts only:

```json
{ "imageUrl": "https://..." }
```

The prompt is **fixed on the server** and never accepted from the client.

## Installation

No additional npm dependency is required for this integration. The project uses the native `fetch` API from the Node.js runtime in Next.js route handlers.

## Environment variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Scope | Purpose |
| -------- | -------- | ----- | ------- |
| `AI_IMAGE_PROVIDER` | Yes | Server | Selects provider: `fake` or `huggingface` |
| `HF_TOKEN` | Only when `AI_IMAGE_PROVIDER=huggingface` | Server | Hugging Face access token used for Inference API authorization |
| `HF_MODEL_ID` | Optional | Server | Primary model id for Hugging Face inference (default: `stabilityai/stable-diffusion-2-1`) |
| `HF_FALLBACK_MODEL_IDS` | Optional | Server | Comma-separated fallback model ids, tried when the primary model is unavailable on `hf-inference` |
| `NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET` | Yes | Client + server | Public Storage bucket for generated images (default: `uploads`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client + server | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for real generation flow) | Server | Service role key used to upload generated images |

Get `HF_TOKEN` from [Hugging Face tokens settings](https://huggingface.co/settings/tokens). Use a server-only env var and never expose it in `NEXT_PUBLIC_*`.
`HF_TOKEN` should be your Hugging Face **User Access Token**.
If your primary model is unsupported on serverless inference, set `HF_MODEL_ID` (and optional `HF_FALLBACK_MODEL_IDS`) to supported text-to-image models.

## Configuration in code

### Provider selection

`createImageGenerationProvider()` in `lib/ai/image-generation.ts` reads `AI_IMAGE_PROVIDER`:

- `fake` -> `FakeImageGenerationProvider`
- `huggingface` -> `HuggingFaceImageGenerationProvider`

Unknown provider values:

- **Production**: throw an error
- **Development**: warn and fall back to `fake`

### Hugging Face request

`lib/ai/huggingface-stable-diffusion.ts` defines:

- Primary model default: `stabilityai/stable-diffusion-2-1` (overridable with `HF_MODEL_ID`)
- Endpoints:
  - `https://api-inference.huggingface.co/models/<model-id>`
  - `https://router.huggingface.co/hf-inference/models/<model-id>`
- Automatic fallback to additional models from `HF_FALLBACK_MODEL_IDS` when provider returns model-unavailable errors
- Fixed server-side prompt builder: `buildStableDiffusionRoomPrompt()`
- Error class: `HuggingFaceInferenceError`

### Storage upload

Generated image bytes are uploaded by `uploadPublicImageBytes()` in `lib/supabase/upload-public-image.ts` and returned as a public URL, which is sent back from `/api/generate` as:

```json
{ "generatedImageUrl": "https://..." }
```

## API contract

### Endpoint

`POST /api/generate`

### Auth

Requires authenticated user (Clerk). Unauthenticated requests return `401`.

### Request body

```json
{ "imageUrl": "https://..." }
```

`imageUrl` must be an absolute `https` URL (`http` localhost is only allowed outside production).

### Success response

```json
{ "generatedImageUrl": "https://..." }
```

### Error behavior

- `400` invalid JSON or validation failure
- `401` unauthorized
- `500` general generation/storage failure
- `502` upstream/provider formatting failures
- `503` model loading/startup case (includes `Retry-After` when available)

## Local verification

1. Set `.env.local`:
   - `AI_IMAGE_PROVIDER=huggingface`
   - `HF_TOKEN=...`
   - Supabase variables configured
2. Start app:

```bash
npm run dev
```

3. Use the dashboard upload flow, or call endpoint directly:

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"imageUrl\":\"https://example.com/room.jpg\"}"
```

You should receive `generatedImageUrl` pointing to your configured Supabase public bucket.

## Troubleshooting

- **`HF_TOKEN is not configured.`**
  - Add `HF_TOKEN` in `.env.local`, restart the dev server.

- **Authorization error from Hugging Face (`401/403`)**
  - Verify token value, permissions, and that it is loaded in the active environment.

- **Model loading / startup (`503`)**
  - Retry after the provided `Retry-After` value (if present), or wait a few seconds and retry.

- **Supabase storage bucket not found**
  - Create bucket matching `NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET` and make it public (or update env to existing bucket id).

- **Provider not switching**
  - Ensure `AI_IMAGE_PROVIDER=huggingface`, and restart app/build process after env changes.

## Notes for developers

- Keep prompt control server-side for consistent output and to avoid client prompt injection.
- Do not log or expose `HF_TOKEN`.
- `.env.example` is committed; `.env.local` is not. Never commit real secrets.
