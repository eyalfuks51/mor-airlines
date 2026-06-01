# Mor Airlines — Full Project Execution Contract

> **To Claude reading this:** Build this app end-to-end. Execute phases 0–6 in order. Each phase has a "Done when" checklist — every item must pass before moving to the next phase. When all phases are complete, the app is shipped. The spec detail lives in this document; you do not need another file.

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

## Pre-Flight Checklist (Do Before Phase 0)

These are manual steps the developer takes before writing code:

- [ ] Create GitHub repo: `mor-airlines` (private)
- [ ] Create Vercel project → import from GitHub repo
- [ ] Create Supabase project (free tier)
- [ ] Generate passport UUID: `node -e "console.log(crypto.randomUUID())"` → save it
- [ ] Run Supabase schema SQL + insert passport row
- [ ] Add env vars to Vercel project settings
- [ ] Create `.env.local` with same vars locally
- [ ] Confirm: `curl $VITE_SUPABASE_URL/rest/v1/passports?id=eq.$VITE_PASSPORT_UUID` returns the row

---

## Phase 0 — Skeleton

**Build:** Vite + TypeScript + Tailwind + RTL + empty Vercel deploy

**Done when:**
- [ ] `npm run dev` starts without errors on port 5173
- [ ] `npm run build` completes with zero errors
- [ ] Deployed to Vercel preview URL — URL loads in browser
- [ ] Page has `<html dir="rtl" lang="he">` in index.html
- [ ] Hebrew text renders RTL (verify with visible Hebrew heading on screen)
- [ ] Tailwind classes apply (verify with at least one styled element)
- [ ] TypeScript strict mode enabled in tsconfig
- [ ] `.env.local` gitignored, `.env.example` committed with key names and empty values

---

## Phase 1 — Static Globe

**Build:** 3D globe rendering all seed destinations with state-based visual encoding

**Done when:**
- [ ] Globe renders and auto-rotates slowly (fills full viewport)
- [ ] All 45 seed destinations visible as points on the globe
- [ ] Israel marked distinctly as "home base" (e.g. house icon or distinct color)
- [ ] Dream destinations: pulsing/glowing dot
- [ ] Starred destinations: pin/heart marker, visually distinct from plain dream
- [ ] Booked destinations: solid filled circle + arc from Israel in "booked" color
- [ ] Visited destinations: muted/filled circle + arc in "visited" color, distinct from booked
- [ ] Click any destination → tooltip shows `nameHe` and `nameEn`
- [ ] "לאן טסים?" button visible, centered at bottom of globe view
- [ ] Globe renders correctly on mobile viewport (375px wide)
- [ ] No console errors in dev mode

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
- [ ] Full ceremony completes on first click with no errors or broken animations
- [ ] Total ceremony duration: 8–15 seconds (configurable constant)
- [ ] Each sound plays at the correct step (bing-bong on click, drumroll during spin, ding on pin drop, applause/cheer on reveal)
- [ ] Confetti fires on destination reveal
- [ ] Flight arc animates from Israel to target
- [ ] Boarding pass shows: "מור & אייל", "מושב 2A — חלון", `nameHe`, `nameEn`, `localDish`, `bestSeason`, `whyHere`
- [ ] Boarding pass shows Wikipedia image (live fetch if not cached, placeholder if Wikipedia unreachable)
- [ ] Boarding pass shows Wikipedia summary (3-line truncation with "ספר לי עוד" to expand)
- [ ] "טוס שוב" re-rolls without page reload — full ceremony repeats with new destination
- [ ] "שמור לדרכון" is wired (may just log to console for now — persistence comes in Phase 3)
- [ ] Ceremony reads exclusively from localStorage on critical path — zero Supabase or external API calls during spin/reveal
- [ ] Wikipedia fetch (for boarding pass image) happens after boarding pass slides in, not during spin
- [ ] Already-visited destinations excluded from lottery pool

---

## Phase 3 — Passport, States & Local Persistence

**Build:** Full Zustand state management, passport screen, localStorage persistence

**Done when:**
- [ ] Zustand store with `persist` middleware writes to localStorage
- [ ] Seed + override merge logic implemented and verified (edit seed destination → stored as override, seed file unchanged, merged result shown in UI)
- [ ] All state transitions work from boarding pass and from destination detail: dream → booked, dream → visited, booked → visited
- [ ] Starred toggle works (star/unstar from any view)
- [ ] All state changes persist across full page reload (close tab, reopen — state preserved)
- [ ] Passport screen accessible via navigation (globe ↔ passport)
- [ ] Passport screen shows destinations grouped by state: היינו (visited with stamps) / מסלול (booked) / חלומות (dream) / דקור (starred)
- [ ] Each destination card in passport shows visual "stamp" matching its state
- [ ] Travel date field on booked destination detail (editable)
- [ ] Visited date field on visited destination detail (editable)
- [ ] Personal note field on visited destination (editable, persists)
- [ ] Globe reflects current state of all destinations (arcs appear when booked/visited)
- [ ] "שמור לדרכון" button on boarding pass correctly transitions destination state

---

## Phase 4 — CRUD + External Data

**Build:** Add / edit / delete destinations, Wikipedia integration, geocoding

**Done when:**
- [ ] "+" button opens add-destination modal
- [ ] Type a place name in modal → Open-Meteo geocoding API returns lat/lng → coordinates auto-fill
- [ ] On save: Wikipedia image + summary fetched and stored in User layer (cached — never re-fetches for same destination)
- [ ] New destination immediately visible on globe after save
- [ ] Edit modal opens for any destination — all fields editable: `nameHe`, `nameEn`, `tagline`, `localDish`, `bestSeason`, `whyHere`, `vibeTags`
- [ ] Editing a seed destination stores override, does not modify seed file
- [ ] User-added destinations can be deleted (confirmation required)
- [ ] Seed destinations cannot be deleted (edit-only)
- [ ] Vibe tags assignable/editable via tag chips in edit modal
- [ ] If geocoding fails → show error and let user enter coordinates manually
- [ ] If Wikipedia unavailable → destination saves without image/summary (graceful degradation)

---

## Phase 5 — Supabase Sync

**Build:** Shared passport between two phones via Supabase blob sync

**Done when:**
- [ ] Supabase JS client initialized using env vars (no hardcoded values)
- [ ] On app load: localStorage renders immediately, then background fetch from Supabase runs within 3 seconds
- [ ] If Supabase blob `updated_at` > localStorage `updated_at` → merge into localStorage, UI updates silently
- [ ] On edit: writes to localStorage immediately, then debounced 2s push of full User layer blob to Supabase
- [ ] Edit on Device A → visible on Device B within 10 seconds on next page load or manual refresh
- [ ] First load on brand-new device (empty localStorage): app loads data from Supabase
- [ ] Ceremony runs at full speed while sync is in-flight (non-blocking)
- [ ] If Supabase is unreachable: app works fully from localStorage, soft offline indicator shown
- [ ] No keys or UUIDs hardcoded in source code
- [ ] `VITE_PASSPORT_UUID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` all sourced from env
- [ ] GitHub Action keep-alive created at `.github/workflows/supabase-keepalive.yml` — pings Supabase once per week (Monday 9am) to prevent free tier pause
- [ ] Keep-alive Action visible and green in GitHub Actions tab

---

## Phase 6 — Filters, Polish & PWA

**Build:** Vibe filters, final visual polish, PWA installability, production deploy

**Done when:**
- [ ] Vibe filter chips render: חוף / עיר / הרפתקה / אוכל / רחוק / קרוב
- [ ] Vibe filters update globe to show only matching destinations
- [ ] State filter works: הכל / חלומות / הזמנות / ביקרנו
- [ ] Active filters apply to lottery pool — only matching destinations can be drawn
- [ ] PWA manifest has: app name "Mor Airlines", `dir: "rtl"`, `lang: "he"`, custom icon (airplane or globe, min 512×512)
- [ ] `vite-plugin-pwa` generates service worker with offline caching
- [ ] App installable via iOS Safari "Add to Home Screen" (no install-blocked warning)
- [ ] App installable via Android Chrome (install banner appears)
- [ ] Offline: ceremony runs from localStorage, globe renders, Supabase sync shows offline indicator
- [ ] All sounds balanced at correct relative volumes
- [ ] App visually polished at 375×812 (iPhone 14) and 412×915 (Pixel 7)
- [ ] Zero console errors in production build
- [ ] `npm run build` produces no TypeScript errors
- [ ] Production deploy live (`vercel --prod`) at stable Vercel URL

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
