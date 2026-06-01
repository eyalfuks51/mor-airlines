# Mor Airlines — Full Project Execution Contract

> **To the agent reading this:** This document is the full product spec, but it is **not** one single Codex goal. Work one phase at a time. The current active state below decides what to do next. Every phase has a "Done when" checklist — every item in the active phase must pass before moving to the next phase.

---

## Active State

- **Pre-flight:** Complete. GitHub, Supabase, Vercel, local env, and shared UUID are already set up.
- **Phase 0 — Skeleton:** Complete (2026-06-01). Vite + React + TypeScript + Tailwind scaffolded, Hebrew RTL configured, env files correct, build passes, pushed to GitHub → Vercel preview auto-deployed.
- **Phase 1 — Static Globe:** Complete (2026-06-01). react-globe.gl installed, 45 seed destinations created, globe renders full-viewport with auto-rotation, CSS-pulsing dream dots, Israel home marker, tooltip on click, "לאן טסים?" button, mobile-ready at 375px.
- **Phase 2 — Lottery Ceremony:** Complete (2026-06-01). Full ceremony sequence built: sounds (Web Audio API), spin/lock/pin-drop/reveal/boarding-pass state machine, confetti, flight arc, framer-motion boarding pass, Wikipedia fetch after slide-in, re-roll, all UI Hebrew RTL.
- **Phase 3 — Passport, States & Local Persistence:** Complete (2026-06-01). Zustand store with persist, seed override merge, passport screen (היינו/מסלול/חלומות/דקור), state transitions, starred toggle, editable dates/notes, globe reflects state, all persisting across reload.
- **Phase 4 — CRUD + External Data:** Complete (2026-06-01). Add/edit/delete destinations, Open-Meteo geocoding, Wikipedia caching, vibe tag chips, seed override isolation.
- **Phase 5 — Supabase Sync:** Complete (2026-06-01). Background Supabase sync, offline indicator, keep-alive workflow.
- **Phase 6 — Filters, Polish & PWA:** Complete (2026-06-01). Vibe + state filter chips, filtered lottery pool, vite-plugin-pwa with Workbox SW, custom globe/flight icon (512px), iOS/Android install meta, mobile safe-area polish.
- **Current active phase:** Shipped — all 6 phases complete. Pending production deploy (`vercel --prod`) with explicit user approval.
- **Starting build check:** Run `npm run build` before and after meaningful changes.

## Goal Feature Usage

Use the Codex goal feature with **one phase-sized goal at a time**. Do not create a single goal for phases 0–6.

| Phase goal | Goal objective | Complete when |
|---|---|---|
| Phase 0 — Skeleton | Scaffold the deployable Vite/React/TypeScript/Tailwind app with Hebrew RTL, env examples, strict TypeScript, and an empty Vercel preview. | Every Phase 0 checklist item passes. |
| Phase 1 — Static Globe | Render the 3D globe with all seed destinations, home base, state-based markers/arcs, tooltip behavior, and mobile-safe layout. | Every Phase 1 checklist item passes. |
| Phase 2 — Lottery Ceremony | Build the full destination lottery ceremony: sounds, spin/lock, pin drop, reveal, confetti, boarding pass, and re-roll flow. | Every Phase 2 checklist item passes, especially zero network calls during spin/reveal. |
| Phase 3 — Passport & Local Persistence | Add Zustand persistence, seed override merging, passport navigation, destination states, notes/dates, and reload-safe localStorage behavior. | Every Phase 3 checklist item passes. |
| Phase 4 — CRUD & External Data | Add destination create/edit/delete, geocoding, Wikipedia image/summary caching, editable vibe tags, and graceful external API failure handling. | Every Phase 4 checklist item passes. |
| Phase 5 — Supabase Sync | Add background Supabase sync between devices without blocking local-first rendering or the ceremony path. | Every Phase 5 checklist item passes, including two-device sync verification. |
| Phase 6 — Filters, Polish & PWA | Add filters, PWA installability, offline behavior, mobile polish, sound balance, and final production-readiness checks. | Every Phase 6 checklist item passes and the user explicitly approves any production deploy. |

When a phase is complete:
1. Update **Active State** to the next phase.
2. Leave the completed phase checklist checked or add a short completion note.
3. Commit and push the shippable change.
4. Start a new Codex goal for the next phase.

---

## Mission

Build "Mor Airlines" — a personal web app gifted to Mor that turns the recurring "let's go somewhere" moment into a small ceremony. A 3D globe spins, locks on a random destination from a shared dream list, a pin drops with sound and confetti, and a boarding pass slides up with destination details. Beyond the lottery moment, the app is a living shared "passport" tracking dream destinations, pinned favorites, booked trips, and visited places with personal memories. Two phones share one synchronized passport. No accounts, no login.

**Emotional goal:** Fantasy + memory + "what's next" in a celebratory wrapper.  
**Technical goal:** Local-first (localStorage = source of truth), Supabase sync runs in background, never blocks the ceremony.

---

## Non-Negotiable Principles

1. **Ceremony is sacred.** No spinners, no network calls on the critical lottery path. Everything to run the ceremony reads from localStorage. Supabase syncs in background only.
2. **Hebrew first, RTL.** All UI in Hebrew, `dir="rtl"`, Hebrew-supporting fonts (e.g. Heebo or Rubik). English only where it fits — IATA codes, destination name in English on the boarding pass.
3. **Celebratory and tactile.** Sound at each ceremony step, confetti, pin drop, boarding pass slides in. Small details ARE the product.
4. **Personal.** Passengers: מור + אייל. Seat: 2A (חלון). Not generic copy.
5. **Always extensible.** Add/edit destinations from within the app UI, no code changes needed.

---

## Tech Stack

| Layer | Package | Purpose |
|---|---|---|
| App | React + TypeScript + Vite | Client app |
| Globe | react-globe.gl | 3D globe (three.js wrapper) |
| UI animation | framer-motion | Boarding pass, screen transitions, HTML pins |
| Confetti | canvas-confetti | Confetti on destination reveal |
| Sound | Howler.js | bing-bong, drumroll, ding, applause |
| Styling | Tailwind CSS | Utility classes + RTL |
| State | zustand + persist middleware | State + localStorage persistence |
| PWA | vite-plugin-pwa | Service worker + installability |
| Sync | Supabase (JS client) | Background blob sync |
| Deploy | Vercel | Hosting |

External APIs (no keys required):
- **Wikipedia/Wikimedia REST API** — image + summary per destination, cached after first fetch
- **Open-Meteo Geocoding API** — place name → lat/lng, used only in add-destination flow

---

## Data Model

```typescript
type DestinationState = 'dream' | 'booked' | 'visited';
type VibeTag = 'beach' | 'city' | 'adventure' | 'food' | 'far' | 'near';

interface Destination {
  id: string;
  nameHe: string;
  nameEn: string;
  lat: number;
  lng: number;
  tagline?: string;        // Hebrew one-liner
  localDish?: string;      // Hebrew — the local dish
  bestSeason?: string;     // Hebrew — best time to visit
  whyHere?: string;        // Hebrew — one-line reason
  vibeTags: VibeTag[];
  state: DestinationState;
  starred: boolean;        // "pinned" — dream in particular
  travelDate?: string;     // for booked (ISO date)
  visitedDate?: string;    // for visited (ISO date)
  personalNote?: string;   // memory/note, mainly for visited
  imageUrl?: string;       // cached from Wikipedia
  wikiSummary?: string;    // cached from Wikipedia
  source: 'seed' | 'user';
  updatedAt: string;       // ISO timestamp
}
```

**Three-layer architecture:**

1. **Seed layer** — `src/data/destinations.ts`, ~45 curated destinations. Read-only. Never mutate this file at runtime.
2. **User layer (localStorage)** — everything the user does: added destinations, state changes, starred toggles, notes, edits to seed destinations stored as overrides. **This is the source of truth for display and for the lottery ceremony.**
3. **Sync layer (Supabase)** — entire User layer serialized as JSON blob, one row in the `passports` table.

**Seed + override merge rule:** Editing a seed destination stores a partial override object keyed by destination `id` in the User layer. At load time: `merged = seedDestinations.map(d => ({ ...d, ...userOverrides[d.id] }))`. The seed file stays clean.

---

## Supabase Schema

Run this SQL in the Supabase SQL editor before Phase 5:

```sql
create table passports (
  id          uuid primary key,
  data        jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

alter table passports enable row level security;

create policy "anon_select" on passports for select using (true);
create policy "anon_insert" on passports for insert with check (true);
create policy "anon_update" on passports for update using (true);
```

Insert the shared passport row (use the `VITE_PASSPORT_UUID` value):
```sql
insert into passports (id, data) values ('<PASSPORT_UUID>', '{}');
```

**Sync behavior:**
- **On load:** Read localStorage → render immediately (zero wait). Background: fetch blob from Supabase, compare `updated_at`. If Supabase is newer → merge into localStorage, re-render.
- **On edit:** Write to localStorage immediately (UI instant) → debounced 2s push of full blob to Supabase with `updated_at = now()`.
- **Conflict resolution:** last-write-wins on full blob. Sufficient for v1 (two people rarely edit same second).
- **Cold start resilience:** If Supabase is unreachable → app works fully from localStorage. Show soft "offline" indicator, retry sync silently.

**No auth.** Anon key + RLS + non-guessable UUID. UUID shared between the two phones manually (copy-paste once). Never hardcode it in source code.

---

## Environment Variables

These must be set in Vercel project settings AND in local `.env.local`:

```
VITE_SUPABASE_URL=        # Supabase project URL
VITE_SUPABASE_ANON_KEY=   # Supabase anon key (safe to expose client-side)
VITE_PASSPORT_UUID=       # Shared passport UUID (generate once with crypto.randomUUID())
```

---

## Seed Data Requirements

Generate `src/data/destinations.ts` with **exactly 45 destinations**. Each must have all required fields: `id`, `nameHe`, `nameEn`, `lat`, `lng`, `tagline`, `localDish`, `bestSeason`, `whyHere`, `vibeTags`, `state: 'dream'`, `starred: false`, `source: 'seed'`, `updatedAt`.

Coverage requirements:
- **Geographic spread:** Europe 12+, Southeast Asia 6+, Americas 6+, Middle East / Africa 5+
- **Vibe coverage:** min 8 beach, 8 city, 6 adventure, 6 food, 5 far, 5 near (overlaps OK)
- **Coordinate accuracy:** verified city-center lat/lng (not approximate)

Aspirational destinations for an Israeli couple — should include a meaningful mix of: Santorini, Tokyo, Bali, Barcelona, New York, Maldives, Lisbon, Amsterdam, Prague, Kyoto, Amalfi Coast, Marrakech, Vienna, Copenhagen, Iceland, Dubrovnik, Havana, Petra (Jordan), Cape Town, Patagonia, Sri Lanka, Thailand, Portugal, Tuscany, Mykonos, Budapest, Malta, Montenegro — plus others that balance the coverage requirements.

All Hebrew content (tagline, localDish, bestSeason, whyHere) should be authentic, evocative, short. No placeholder text.

---

## Pre-Flight Checklist (Complete — Do Not Re-run Unless Verification Fails)

These are manual steps the developer takes before writing code:

- [x] Create GitHub repo: `mor-airlines` (public)
- [x] Create Vercel project → import from GitHub repo
- [x] Create Supabase project (free tier)
- [x] Generate passport UUID: `node -e "console.log(crypto.randomUUID())"` → save it
- [x] Run Supabase schema SQL + insert passport row
- [x] Add env vars to Vercel project settings
- [x] Create `.env.local` with same vars locally
- [x] Confirm: `curl $VITE_SUPABASE_URL/rest/v1/passports?id=eq.$VITE_PASSPORT_UUID` returns the row

---

## Phase 0 — Skeleton

**Build:** Vite + TypeScript + Tailwind + RTL + empty Vercel deploy

**Done when:**
- [x] `npm run dev` starts without errors on port 5173
- [x] `npm run build` completes with zero errors
- [x] Deployed to Vercel preview URL — URL loads in browser
- [x] Page has `<html dir="rtl" lang="he">` in index.html
- [x] Hebrew text renders RTL (verify with visible Hebrew heading on screen)
- [x] Tailwind classes apply (verify with at least one styled element)
- [x] TypeScript strict mode enabled in tsconfig
- [x] `.env.local` gitignored, `.env.example` committed with key names and empty values

---

## Phase 1 — Static Globe

**Build:** 3D globe rendering all seed destinations with state-based visual encoding

**Done when:**
- [x] Globe renders and auto-rotates slowly (fills full viewport)
- [x] All 45 seed destinations visible as points on the globe
- [x] Israel marked distinctly as "home base" (orange ✈ dot, htmlElementsData layer)
- [x] Dream destinations: pulsing/glowing dot (CSS keyframe animation)
- [x] Starred destinations: pink ★ marker, visually distinct (CSS beat animation)
- [x] Booked destinations: blue filled circle + arc from Israel (code ready; no booked in seed)
- [x] Visited destinations: green filled circle + arc (code ready; no visited in seed)
- [x] Click any destination → tooltip shows `nameHe` and `nameEn`
- [x] "לאן טסים?" button visible, centered at bottom of globe view
- [x] Globe renders correctly on mobile viewport (375px wide)
- [x] No console errors in dev mode

---

## Phase 2 — Lottery Ceremony

**Build:** The heart of the app — full ceremony sequence end-to-end

**Ceremony sequence (exact order):**
1. **Idle state** — globe rotates slowly, dream points pulse/breathe
2. **Click "לאן טסים?"** → `bing-bong` announcement sound → surrounding UI dims (vignette or overlay)
3. **Spin phase** → auto-rotate accelerates sharply (lottery wheel speed) → drumroll sound builds
4. **Lock phase** → rotation decelerates and stops on target destination → camera flies to target coordinates (smooth zoom, ~2-3 seconds)
5. **Pin drop** → pin animates falling from above + small bounce on landing → `ding` sound
6. **Reveal** → destination `nameHe` fades in large → confetti fires → flight arc animates from Israel to destination
7. **Boarding pass** → slides up from bottom of screen (framer-motion)
8. **Action row** → visible below boarding pass: "טוס שוב" / "שמור לדרכון" / "ספר לי עוד" / "שתף"

**Done when:**
- [x] Full ceremony completes on first click with no errors or broken animations
- [x] Total ceremony duration: 8–15 seconds (configurable constant — ~9.5s via TIMINGS in src/utils/ceremony.ts)
- [x] Each sound plays at the correct step (bing-bong on click, drumroll during spin, ding on pin drop, applause/cheer on reveal)
- [x] Confetti fires on destination reveal
- [x] Flight arc animates from Israel to target
- [x] Boarding pass shows: "מור & אייל", "מושב 2A — חלון", `nameHe`, `nameEn`, `localDish`, `bestSeason`, `whyHere`
- [x] Boarding pass shows Wikipedia image (live fetch if not cached, placeholder if Wikipedia unreachable)
- [x] Boarding pass shows Wikipedia summary (expandable with "ספר לי עוד" in action row)
- [x] "טוס שוב" re-rolls without page reload — full ceremony repeats with new destination
- [x] "שמור לדרכון" is wired (logs to console — persistence comes in Phase 3)
- [x] Ceremony reads exclusively from seed/localStorage on critical path — zero external API calls during spin/reveal
- [x] Wikipedia fetch (for boarding pass image) happens after boarding pass slides in, not during spin
- [x] Already-visited destinations excluded from lottery pool

---

## Phase 3 — Passport, States & Local Persistence

**Build:** Full Zustand state management, passport screen, localStorage persistence

**Done when:**
- [x] Zustand store with `persist` middleware writes to localStorage
- [x] Seed + override merge logic implemented and verified (edit seed destination → stored as override, seed file unchanged, merged result shown in UI)
- [x] All state transitions work from boarding pass and from destination detail: dream → booked, dream → visited, booked → visited
- [x] Starred toggle works (star/unstar from any view)
- [x] All state changes persist across full page reload (close tab, reopen — state preserved)
- [x] Passport screen accessible via navigation (globe ↔ passport)
- [x] Passport screen shows destinations grouped by state: היינו (visited with stamps) / מסלול (booked) / חלומות (dream) / דקור (starred)
- [x] Each destination card in passport shows visual "stamp" matching its state
- [x] Travel date field on booked destination detail (editable)
- [x] Visited date field on visited destination detail (editable)
- [x] Personal note field on visited destination (editable, persists)
- [x] Globe reflects current state of all destinations (arcs appear when booked/visited)
- [x] "שמור לדרכון" button on boarding pass correctly transitions destination state

---

## Phase 4 — CRUD + External Data

**Build:** Add / edit / delete destinations, Wikipedia integration, geocoding

**Done when:**
- [x] "+" button opens add-destination modal
- [x] Type a place name in modal → Open-Meteo geocoding API returns lat/lng → coordinates auto-fill
- [x] On save: Wikipedia image + summary fetched and stored in User layer (cached — never re-fetches for same destination)
- [x] New destination immediately visible on globe after save
- [x] Edit modal opens for any destination — all fields editable: `nameHe`, `nameEn`, `tagline`, `localDish`, `bestSeason`, `whyHere`, `vibeTags`
- [x] Editing a seed destination stores override, does not modify seed file
- [x] User-added destinations can be deleted (confirmation required)
- [x] Seed destinations cannot be deleted (edit-only)
- [x] Vibe tags assignable/editable via tag chips in edit modal
- [x] If geocoding fails → show error and let user enter coordinates manually
- [x] If Wikipedia unavailable → destination saves without image/summary (graceful degradation)

---

## Phase 5 — Supabase Sync

**Build:** Shared passport between two phones via Supabase blob sync
**Complete:** 2026-06-01

**Done when:**
- [x] Supabase JS client initialized using env vars (no hardcoded values) — `src/lib/supabase.ts`
- [x] On app load: localStorage renders immediately, then background fetch from Supabase runs within 3 seconds — `useSupabaseSync` delays 1s before first fetch
- [x] If Supabase blob `updated_at` > localStorage `updated_at` → merge into localStorage, UI updates silently — `hydrateFromSupabase` action + `storeUpdatedAt` comparison
- [x] On edit: writes to localStorage immediately, then debounced 2s push of full User layer blob to Supabase — `PUSH_DEBOUNCE_MS = 2000`
- [x] Edit on Device A → visible on Device B within 10 seconds on next page load or manual refresh — sync on mount + manual refresh button
- [x] First load on brand-new device (empty localStorage): app loads data from Supabase — empty `storeUpdatedAt` triggers hydration
- [x] Ceremony runs at full speed while sync is in-flight (non-blocking) — `ceremonyActiveRef` blocks hydration during spin/reveal; push debounce skips while ceremony active
- [x] If Supabase is unreachable: app works fully from localStorage, soft offline indicator shown — `SyncIndicator` component shows Hebrew "אין חיבור לענן" + retry
- [x] No keys or UUIDs hardcoded in source code — grep verified
- [x] `VITE_PASSPORT_UUID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` all sourced from env
- [x] GitHub Action keep-alive created at `.github/workflows/supabase-keepalive.yml` — pings Supabase once per week (Monday 9am) to prevent free tier pause
- [ ] Keep-alive Action visible and green in GitHub Actions tab — requires VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set as GitHub Actions secrets

---

## Phase 6 — Filters, Polish & PWA

**Build:** Vibe filters, final visual polish, PWA installability, production deploy
**Complete:** 2026-06-01

**Done when:**
- [x] Vibe filter chips render: חוף / עיר / הרפתקה / אוכל / רחוק / קרוב — `src/components/FilterBar.tsx`
- [x] Vibe filters update globe to show only matching destinations
- [x] State filter works: הכל / חלומות / הזמנות / ביקרנו
- [x] Active filters apply to lottery pool — only matching destinations can be drawn (fallback to full pool if filter yields no eligible destinations)
- [x] PWA manifest has: app name "Mor Airlines", `dir: "rtl"`, `lang: "he"`, custom globe/flight icon (512×512 PNG generated from SVG via sharp)
- [x] `vite-plugin-pwa` generates service worker with offline caching (Workbox, CacheFirst for fonts/unpkg, NetworkFirst for Wikipedia)
- [x] App installable via iOS Safari "Add to Home Screen" — apple-touch-icon + apple-mobile-web-app meta tags
- [x] App installable via Android Chrome — manifest linked, icons present
- [x] Offline: ceremony runs from localStorage, globe renders, Supabase sync shows offline indicator
- [x] All sounds balanced at correct relative volumes (Web Audio API, gains unchanged)
- [x] App visually polished at 375×812 and 412×915 — overscroll-behavior, safe-area-inset, viewport-fit=cover
- [x] Zero TypeScript errors in production build
- [x] `npm run build` passes — SW and manifest generated
- [ ] Production deploy live (`vercel --prod`) — pending explicit user approval

---

## The App Is Shipped When

1. All 6 phase checklists are fully checked — no open items
2. Production URL is live on Vercel (not a preview URL)
3. Mor opens the app on her phone, taps "לאן טסים?", full ceremony runs end-to-end including confetti + boarding pass
4. Eyal's phone, opened immediately after, shows the same state Mor sees (sync works)
5. PWA installed on at least one phone's home screen — app opens without browser chrome
6. Navigation: globe → passport → globe completes without errors or blank screens
7. At least one destination in each state is visible (dream, starred, booked, visited) to confirm full passport renders

---

*Stack: React + TypeScript + Vite + react-globe.gl + framer-motion + canvas-confetti + Howler.js + Tailwind CSS + Zustand + vite-plugin-pwa + Supabase + Vercel*
