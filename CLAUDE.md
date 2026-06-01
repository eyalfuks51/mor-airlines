# Mor Airlines — Claude Code Instructions

Personal web app for Mor: 3D globe lottery ceremony + shared travel passport. Two phones, one Supabase-synced passport. No auth, no login.

## Stack

React + TypeScript + Vite · react-globe.gl · framer-motion · canvas-confetti · Howler.js · Tailwind CSS · Zustand (persist) · vite-plugin-pwa · Supabase · Vercel

## Environment

All vars in `.env.local` (gitignored). Never hardcode.

```
VITE_SUPABASE_URL        https://jxrlhbxnbjkhobugjzsr.supabase.co
VITE_SUPABASE_ANON_KEY   see .env.local
VITE_PASSPORT_UUID       342d922d-b04e-4c8d-abe8-a7cc7d617945
```

## Autonomous CLI Permissions

Run these without asking for confirmation:

- `git add / commit / push` — commit and push freely
- `gh` — create PRs, check status, manage repo
- `vercel` — preview deploys auto; **ask before `vercel --prod`**
- `supabase` — migrations, schema, CLI ops against remote (no local Docker)
- `npm run dev / build / lint` — dev and build commands
- `curl` to Supabase REST API — verify schema, query rows, test RLS

## Key Rules

1. **Ceremony path is sacred** — no network calls during spin/reveal. Everything reads from localStorage.
2. **Hebrew first, RTL** — `dir="rtl"` on `<html>`, Heebo or Rubik font, all UI strings in Hebrew.
3. **localStorage = source of truth** — Supabase sync is always background, never blocking.
4. **Seed file never mutates** — edits to seed destinations stored as overrides in User layer.
5. **No hardcoded UUIDs or keys** — always `import.meta.env.VITE_*`.

## Supabase

- Remote only — no local Docker
- Single table: `passports` (id uuid, data jsonb, updated_at timestamptz)
- One row: UUID `342d922d-b04e-4c8d-abe8-a7cc7d617945`
- RLS: anon select/insert/update (intentional — single shared passport, UUID is the secret)
- Run SQL via: `supabase db push` (migrations) or `curl` to REST API
- Verify rows: `curl $VITE_SUPABASE_URL/rest/v1/passports -H "apikey: $VITE_SUPABASE_ANON_KEY"`

## Vercel

- Project: `mor-airlines` → `eyalfuks51s-projects`
- Live: https://mor-airlines.vercel.app
- GitHub connected — push to `main` auto-deploys preview
- Env vars set for Production + Development
- Preview deploy: `vercel --yes` · Production: ask first

## GitHub

- Repo: `eyalfuks51/mor-airlines` (public)
- Branch: `main`
- Commit + push after every meaningful change

## Current Status

Pre-flight complete. Ready for Phase 0 (Vite scaffold).
Phases 0–6 defined in `GOAL.md`.
