# Handoff — Acts Platform map upgrade: birthplaces + searchable map

**For:** a fresh Claude (Cowork) session / new Claude Project working on the `Acts-platform` repo.
**Author:** previous Cowork session, for Pastor Fidele Bolton (fidelebolton.com).
**Goal:** Two upgrades to the interactive map in the Acts platform:
1. **Clearly show the birthplaces** of Barnabas (Cyprus) and Saul / Paul (Tarsus).
2. **Make the map searchable** — type a place name and the map flies to it and opens its popup.

Read sections 1–2 first. Section 2 (environment gotchas) will save you hours.

---

## 1. Project at a glance

- **Repo (local):** `C:\Users\fidel\OneDrive\Documents\Claude\Projects\Acts-platform\` (this folder; OneDrive-synced).
- **GitHub:** `github.com/fidelebolton/Acts-platform` (public, branch `main`).
- **Live site:** https://acts.fidelebolton.com (Netlify) · fallback https://acts-platform.netlify.app
- **Stack:** React 18 + TypeScript + Vite + Tailwind + **MapLibre GL JS** + `@turf/turf`. Static, no backend.
- **Bilingual:** English (`en`) + Kinyarwanda (`rw`) via a small i18n context. Every UI string is keyed.
- **Deploy:** push to `main` → Netlify auto-builds (runs `npm run data` then `vite build`).

The map is the right-hand pane. Component: `src/components/MapPane.tsx`. It renders three things on a MapLibre map: generic **locations** (navy dots), Paul's/early-church **journey routes + stops** (colored), and several overlay layers (numbered pins, origin/destination labels, verse-highlight pulse, animated route). A collapsible **legend** (top-left) selects a journey.

> Note: a separate feature (a to-scale Timeline overlay, commit `047014e`) may still be **local-only / unpushed** on this machine. Before you start: open GitHub Desktop, make sure `main` is pushed and your working tree is clean, so you build on top of the latest code.

---

## 2. CRITICAL environment gotchas (read before building)

This repo lives in a **OneDrive** folder mounted into the Cowork Linux sandbox. Three things bite:

1. **`node_modules` is only partially materialized in the sandbox** (missing `typescript/lib`, `.bin/`). You **cannot** typecheck/build in place. To verify your changes, build a clean copy:
   ```bash
   SRC=/sessions/<session>/mnt/Acts-platform        # your actual mount path
   DST=/tmp/acts-verify
   rm -rf "$DST"; mkdir -p "$DST"
   cp -r "$SRC"/{src,public,index.html,package.json,tsconfig.json,tsconfig.node.json,vite.config.ts,tailwind.config.js,postcss.config.js} "$DST"/
   cd "$DST" && npm install --no-audit --no-fund    # registry reachable, ~37s
   node node_modules/typescript/bin/tsc -b           # typecheck (use node, NOT npx tsc)
   node node_modules/vite/bin/vite.js build          # production build
   ```
   `npx tsc` installs the wrong package — always invoke the local binary via `node node_modules/...`.

2. **File-tool edits can lag/truncate in the bash view.** Files written with the Edit/Write tools sometimes appear truncated to `bash` (OneDrive sync delay). Since **git commits from bash**, make bash authoritative: after editing, re-validate in bash (`python3 -c "import json,...; json.load(...)"` for JSON; `node -e "..."` or a quick `tsc` for TS) and, if a file looks stale/truncated in bash, re-write it via a bash heredoc before committing.

3. **No GitHub credentials in the sandbox.** `git push` fails with `could not read Username`. You can `git add` + `git commit` from bash, but **Pastor Fidele must push from his machine** (GitHub Desktop → Push origin). The commit rides along in the OneDrive-synced `.git`, so it shows up on his computer as "ahead by 1." Tell him exactly what to push.

---

## 3. What to build

### 3a. Birthplace markers

Add two **clearly distinct, always-visible** markers that read as birthplaces (different from the generic navy location dots and the colored journey stops). Suggested treatment: a gold star / home icon with a permanent bold label and a rich bilingual popup.

| Person | Birthplace | Scripture | Coordinates (lon, lat) | Modern |
|---|---|---|---|---|
| **Saul / Paul** | **Tarsus** of Cilicia | Acts 9:11; 21:39; **22:3** ("born in Tarsus of Cilicia") | `34.8920, 36.9177` | Tarsus, Mersin, Türkiye |
| **Barnabas** | **Cyprus** (traditional hometown: **Salamis**) | **Acts 4:36** ("Joseph… a Levite, a native of Cyprus") | `33.9006, 35.1814` (Salamis) | Salamis ruins, near Famagusta, Cyprus |

Both points already exist in the data as journey stops (Tarsus in `movement-saul` / `movement-antioch`; Salamis in `journey-1`), but nothing labels them as birthplaces. **Coordinate order in the data is `[lon, lat]`** — keep that straight.

> **Decision to confirm (see §6):** Scripture says Barnabas was "of Cyprus" (the island), not specifically Salamis. Recommended: pin **Salamis** and label it "Cyprus (Salamis)", since Salamis is the traditional hometown and already on the map. Alternative: a generic island-centroid point labeled just "Cyprus."

**Recommended implementation (lowest friction, survives the build pipeline):**
Create a small **committed** module `src/data/birthplaces.ts` exporting a typed array:
```ts
export interface Birthplace {
  id: 'paul' | 'barnabas';
  lon: number; lat: number;
  // i18n keys → src/i18n/{en,rw}.json under a new "birthplaces" block
}
export const BIRTHPLACES: Birthplace[] = [
  { id: 'paul',     lon: 34.8920, lat: 36.9177 },
  { id: 'barnabas', lon: 33.9006, lat: 35.1814 },
];
```
Then in `MapPane.tsx` add a dedicated `birthplaces` GeoJSON **source + symbol/circle layers** (mirror the existing `locations` pattern at lines ~131–216), drawn **on top** so they're always visible regardless of active panel/journey, with a click popup. Put the labels (person, place, "birthplace", verse, one-line note) in i18n so they translate.

Why a committed TS module rather than the data scripts: `public/data/locations.json` and `public/data/journeys.geojson` are **generated at build time and git-ignored** (regenerated by `npm run data`). A hand-authored TS constant is committed, needs no geocoding dataset, and is trivial to render. (Alternative if you prefer data-driven: add the two as special features in `scripts/build-journeys.mjs` with a `kind: 'birthplace'` and emit them into the GeoJSON — more "correct" but more moving parts.)

### 3b. Searchable map

Add a **search box** overlay on the map. As the user types a place name (e.g. "Tarsus", "Korinto", "Malta"), show matching results; selecting one (or pressing Enter) **flies the map to that location and opens its popup**.

Design notes:
- **Index to search:** the union of (a) every **journey stop** (`journeys.features` where `kind==='stop'` → `name` + `name_rw`), (b) every **location** (`ancient_name`, `modern_name`), and (c) the two **birthplaces**. De-duplicate by name/coords.
- **Bilingual:** match against both English and Kinyarwanda names. Kinyarwanda stop names live on `name_rw`/`notes_rw` (from `scripts/data/rw-journeys.json`); generic locations only have English names today, so English fallback is fine.
- **Behavior:** case/diacritic-insensitive `includes` match → dropdown of up to ~8 results → on select `map.flyTo({ center:[lon,lat], zoom: max(current,6) })` and open a popup (reuse the existing popup HTML pattern + `escapeHtml`). Clear button resets.
- **Accessibility:** real `<input>` with a visible/he-readable label, keyboard up/down/enter, Esc to close. Min font-size 13px+.
- **Placement:** a compact input top-center or directly under the legend; must not cover the map on mobile (the legend already collapses below 640px — match that pattern).

> **Heads-up (important):** `App.tsx` currently passes **only the panel-filtered** `visibleLocations` into `MapPane` (see `App.tsx` ~line 87 `visibleLocations` and the `<MapPane locations={visibleLocations} …>` usage). For search to find places **outside the current panel**, give `MapPane` the **full** dataset — either add a `allLocations` prop, or search `journeys` (which always holds every stop) plus the birthplaces. Don't search only `visibleLocations`.

---

## 4. Map architecture you'll work in

`src/components/MapPane.tsx` (single file, ~830 lines). Key patterns to reuse:

- **Sources/layers added once**, guarded by `if (!map.getSource(...))`, inside `useEffect`s keyed on `[data, mapLoaded]`. Follow the `locations` block (lines ~109–217) as the template for your `birthplaces` layer.
- **i18n inside MapLibre click handlers:** handlers are registered once, so they read current language via **refs** — `tRef`, `fmtRef`, `langRef` (lines ~57–64). Use these in any popup you build, not `t` directly, or popups will freeze on the language that was active when the layer was created. Symbol-layer label text (e.g. Origin/Destination) is refreshed in a dedicated effect on language change (lines ~468–476) — do the same if your birthplace labels are MapLibre symbol layers.
- **Popups:** `new maplibregl.Popup({offset}) .setLngLat([lon,lat]) .setHTML(...) .addTo(map)`, HTML built with Tailwind classes and the local `escapeHtml()` helper (bottom of file). A single `popupRef` is reused (remove the old one before opening a new one).
- **Fly/fit:** `map.flyTo(...)` for a single point; `map.fitBounds(turf.bbox(...))` for a route/area (lines ~451–462, 739–753).
- **Colors / theme:** Navy `#1B2A4A`, Gold `#C9A84C`, Cream `#FDF8F0`, Wine `#7B2D26`. Defined in `tailwind.config.js`. Tile style: OpenFreeMap "positron."
- **Data shapes:** `src/types/index.ts` → `ActsLocation`, `RouteFeature`, `StopFeature`, `JourneysCollection`. Stop props include `journey_id, color, sequence, total_stops, name, acts_ref, notes` plus the runtime-added `name_rw/notes_rw`.

**Data pipeline (for context):**
- `scripts/build-journeys.mjs` — hand-coded routes/stops as `[name, lon, lat, 'Acts X:Y', 'note']` rows → emits `public/data/journeys.geojson` (9 routes, ~99 stops). Tarsus and Salamis rows live here.
- `scripts/parse-locations.mjs` — derives `public/data/locations.json` from the OpenBible geocoding dataset (cloned in the Netlify build).
- `scripts/data/rw-journeys.json` — Kinyarwanda overlay for stop names/notes.
- Both generated JSONs are **git-ignored** — never hand-edit them as a persistent change.

---

## 5. Exact facts & strings to use

- **Paul / Tarsus:** "I am a Jew, born in Tarsus of Cilicia" (Acts 22:3); "a citizen of no ordinary city" (Acts 21:39). Coords `lon 34.8920, lat 36.9177`.
- **Barnabas / Cyprus:** "Joseph, a Levite, a native of Cyprus, whom the apostles called Barnabas (which means 'son of encouragement')" (Acts 4:36). Salamis coords `lon 33.9006, lat 35.1814`.
- Suggested English labels: **"Tarsus — birthplace of Saul (Paul)"**, **"Cyprus (Salamis) — birthplace of Barnabas"**.
- Suggested Kinyarwanda (verify with Pastor — he is the authority): **"Taruso — aho Sawuli (Pawulo) yavukiye"**, **"Kupuro (Salami) — aho Barinaba yavukiye"**. ("yavukiye" = was born at.)

---

## 6. Decisions to confirm with Pastor Fidele before building

1. **Barnabas's pin:** Salamis (recommended, labeled "Cyprus (Salamis)") vs. a generic Cyprus-island point?
2. **Always-on vs. toggle:** Should birthplaces always show, or sit behind a legend toggle like the journeys? (Recommended: always on — the request is to "clearly show" them.)
3. **Marker style:** gold star, home icon, or a labeled ring? (Recommended: gold star + permanent label so they pop against the navy dots.)
4. **Search scope:** just place names, or also journeys and Acts references? (Recommended: place names across stops + locations + birthplaces.)

---

## 7. i18n requirements (don't skip — it breaks the build otherwise)

- Add a new block (e.g. `"birthplaces"` and `"mapSearch"`) to **both** `src/i18n/en.json` **and** `src/i18n/rw.json`.
- **The two files must have identical key shapes.** The active dictionary is typed as `t: Dict = typeof en`, and `DICTIONARIES[lang]` must be assignable to it — if `rw.json` is missing a key that `en.json` has, `tsc` fails. Add the same keys to both (English values are fine as placeholders for rw if a translation isn't ready, but the previous session left real Kinyarwanda drafts — match that).
- Map UI strings already live under `t.map.*` (e.g. `legendHeader`, `allLocations`, `popupToday`, `jumpToVerse`). Put new search strings under `t.mapSearch.*` (placeholder, noResults, clear, label) and birthplace strings under `t.birthplaces.*`.

---

## 8. Build / verify / deploy checklist

1. Make edits (MapPane.tsx, `src/data/birthplaces.ts`, en.json, rw.json; optionally App.tsx to pass full locations).
2. **Verify** in `/tmp/acts-verify` per §2: `tsc -b` clean **and** `vite build` succeeds.
3. Sanity-check the data: birthplace coords resolve to Tarsus/Salamis; search index includes them.
4. `git add -A && git commit` from bash (set `-c user.name`/`user.email` if needed).
5. **Hand off the push** to Pastor Fidele (GitHub Desktop → Push origin). Netlify rebuilds in ~1 min.
6. Confirm live: open https://acts.fidelebolton.com → birthplace markers visible; type "Tarsus" in search → map flies there.

---

## 9. Acceptance criteria

- Tarsus and Cyprus/Salamis are visibly marked as **birthplaces** (distinct style + label), always on screen, with bilingual popups citing Acts 22:3 and Acts 4:36.
- A search box finds any mapped place by English or Kinyarwanda name and flies to it with its popup open — including places outside the current panel.
- `tsc -b` and `vite build` both pass; en/rw i18n shapes match.
- No regression to existing map behavior (journey select, walk-the-journey, verse↔map pulse, mobile legend, the resize fix).

---

*Tip for the new session: start by reading `src/components/MapPane.tsx` (the `locations` layer block and the `tRef/fmtRef/langRef` pattern), then `src/types/index.ts`, then `src/i18n/en.json`. Build the birthplace layer first (small, self-contained), verify, then add search.*
