# Mor Airlines — Agent Instructions

See `CLAUDE.md` for full project context, stack, and CLI permissions.

## How to Work on This Project

### Always start a task by
1. Reading `GOAL.md` to know which phase is active and what "done" looks like
2. Checking `npm run build` passes before and after changes, except before Phase 0 creates `package.json`
3. Verifying RTL + Hebrew render (no English placeholder text in UI)

### Deploying
- After any shippable change: `git add -A && git commit -m "..." && git push`
- Push to `main` auto-triggers Vercel preview deploy — no manual step needed
- Check deploy: `vercel ls` or inspect the GitHub push notification
- **Never deploy to production (`vercel --prod`) without explicit user instruction**

### Supabase changes
- Schema changes → write migration file to `supabase/migrations/` → `supabase db push`
- Verify with curl against REST API (no local Docker needed)
- Never modify the `passports` RLS policies — intentional open access, see `CLAUDE.md`

### Adding dependencies
```bash
npm install <package>          # runtime
npm install -D <package>       # dev-only
```
Then commit `package.json` + `package-lock.json`.

### File structure (once scaffolded)
```
src/
  data/destinations.ts     # seed layer — never mutate at runtime
  store/                   # zustand store + persist
  components/              # globe, boarding pass, passport screen, modals
  hooks/                   # supabase sync, wiki fetch, geocoding
  assets/sounds/           # howler audio files
```

## What Not to Do

- Don't call Supabase on the lottery ceremony critical path
- Don't add auth — intentionally auth-free
- Don't commit `.env.local`, `.env`, or any file with real keys
- Don't run `supabase start` (local Docker) — remote only
- Don't add AWS, Firebase, or any infra beyond Supabase + Vercel
