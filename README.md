# VoxNote

AI-powered meeting intelligence MVP. Upload a meeting recording or paste a transcript and receive structured meeting notes: summary, key points, decisions, action items, complaints, risks and follow-ups.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 + Lucide icons
- NVIDIA NIM chat completions as primary LLM
- Gemini API as automatic fallback
- Optional NVIDIA hosted ASR endpoint for transcription
- Vercel deployment

## Why a web app?

The workflow is upload/paste → analyze → review → export. A responsive web app is easier to share with a team and deploy than a native desktop/mobile app.

## Local setup

Requirements: Node.js 20.9+ and npm/pnpm.

```bash
npm install
cp .env.example .env.local
# Add your provider keys to .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NVIDIA_API_KEY` | Recommended | NVIDIA API key |
| `NVIDIA_MODEL` | No | NVIDIA chat model; default `meta/llama-3.3-70b-instruct` |
| `NVIDIA_BASE_URL` | No | Defaults to `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_ASR_URL` | No | NVIDIA hosted ASR endpoint URL copied from the selected NIM API page |
| `GEMINI_API_KEY` | Recommended | Fallback key |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash` |
| `MAX_AUDIO_MB` | No | Audio upload limit; default 15 MB |

Configure both NVIDIA and Gemini keys for the intended primary/fallback behavior. If NVIDIA is unavailable, Gemini handles transcript analysis. For audio, VoxNote first attempts the optional NVIDIA ASR endpoint; if it is missing or fails, Gemini receives the audio and generates the structured analysis.

### NVIDIA audio transcription

NVIDIA ASR endpoints are model/deployment-specific. Create or select a hosted ASR endpoint in NVIDIA Build, then paste its exact inference URL into `NVIDIA_ASR_URL`. The endpoint must accept multipart form data with a `file` field and return JSON containing `text`, `transcription`, or `transcript`. If you do not configure an ASR endpoint, Gemini handles audio directly.

NVIDIA chat model availability can vary by API catalog and account. Set `NVIDIA_MODEL` to a model enabled for your NVIDIA API key.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, select **Add New → Project** and import the repository.
3. Keep the framework preset as Next.js.
4. Add `NVIDIA_API_KEY`, `GEMINI_API_KEY`, and optional model/ASR variables in Project Settings → Environment Variables.
5. Deploy.

No Docker, Redis, worker process, or separate backend is required for this MVP.

## Current MVP scope and limitations

- Audio files are limited by `MAX_AUDIO_MB` (15 MB by default) because the MVP sends audio inline to Gemini when NVIDIA ASR is not configured. Increase only after validating provider and Vercel request limits.
- Vercel Functions have execution and request-body limits. For longer recordings, the next step is direct-to-object-storage upload (for example, Vercel Blob or S3) and asynchronous processing.
- Meeting history is stored in browser localStorage, not a shared database. It is local to the browser/device and can be cleared by the user.
- No authentication, team collaboration, workflow execution, or integrations are included yet.
- AI outputs are drafts. Owners, dates, decisions and complaint severity should be reviewed by a human before operational use.
- No automatic speaker diarization is guaranteed in this MVP. Supply a transcript with speaker labels when speaker attribution matters.

## Project structure

```text
src/
  app/
    api/analyze/route.ts
    globals.css
    layout.tsx
    page.tsx
  lib/
    ai.ts
    prompts.ts
    types.ts
```

## Security

- API keys are read only in server-side route handlers.
- Do not prefix secrets with `NEXT_PUBLIC_`.
- Meeting content is sent to the configured AI provider(s) for processing. Avoid uploading confidential recordings unless your organization has approved the provider and retention settings.
