# Handoff — "Acts Atlas": one map per key figure (new mode in the Acts site)

**For:** a fresh Claude (Cowork) session / new Claude Project working on the `Acts-platform` repo.
**Author:** previous Cowork session, for Pastor Fidele Bolton (fidelebolton.com).
**Supersedes:** the earlier `HANDOFF_map-birthplaces-and-search.md` — birthplaces and search are now folded into this Atlas plan.

## The vision (in Pastor Fidele's words)
> "An atlas — a collection of maps. Follow key figures and show where they ministered, show details of their lives, one map at a time. A map covers a figure."

So: a new **Atlas mode** inside acts.fidelebolton.com. The user picks a figure; the screen becomes **that one person's map** — their birthplace, the path of their ministry, the places they served — alongside a **biography panel** (who they were, key moments with Acts references, and how their life ended). One figure at a time.

**Confirmed scope (from Pastor Fidele):**
- **Home:** a new mode *inside* the existing Acts site (reuse the map, journeys data, and bilingual setup). Not a separate site.
- **Figures (6, core of Acts):** Peter, Paul (Saul), Barnabas, Philip, Stephen, James.
- **Life detail:** Acts **plus church tradition** (birthplace, ministry, how they died) — tradition must be **visually labeled as tradition, not Scripture**.
- **Bilingual:** English + Kinyarwanda, same as the rest of the site.

Read sections 1–2 first; section 2 will save you hours.

---

## 1. Project at a glance

- **Repo (local):** `C:\Users\fidel\OneDrive\Documents\Claude\Projects\Acts-platform\` (OneDrive-synced).
- **GitHub:** `github.com/fidelebolton/Acts-platform` (public, branch `main`). **Live:** https://acts.fidelebolton.com
- **Stack:** React 18 + TypeScript + Vite + Tailwind + **MapLibre GL JS** + `@turf/turf`. Static, no backend.
- **Bilingual i18n:** `src/i18n/en.json` + `rw.json`, consumed via `useT()` (`src/i18n/LanguageContext.tsx`).
- **Deploy:** push `main` → Netlify auto-builds (`npm run data` then `vite build`).
- **Theme:** Navy `#1B2A4A`, Gold `#C9A84C`, Cream `#FDF8F0`, Wine `#7B2D26`. Georgia (headings), Calibri (body). In `tailwind.config.js`.

**The data you already have (key!):** `public/data/journeys.geojson` already contains per-figure "movements" plus Paul's journeys — each as a `route` LineString + numbered `stop` Points, every stop with `name`, `acts_ref`, `notes`, and a Kinyarwanda overlay (`name_rw`, `notes_rw`). Source of truth is the hand-coded `scripts/build-journeys.mjs`; the GeoJSON is generated at build time and **git-ignored**. The existing movement/journey ids:

| Route id | Covers | Maps to figure |
|---|---|---|
| `movement-jerusalem` | Acts 1–7 Jerusalem sites (Upper Room, Solomon's Portico, Beautiful Gate, Sanhedrin, Akeldama…) | Peter (early), Stephen, James |
| `movement-philip` | Acts 8: Jerusalem→Samaria→Gaza road→Azotus→Caesarea | **Philip** |
| `movement-saul` | Acts 9 + Gal 1: Jerusalem→Damascus→Straight St→Arabia→Tarsus | **Paul** (early) |
| `movement-peter` | Acts 9:32–10:48: Jerusalem→Lydda→Joppa→Caesarea→Jerusalem | **Peter** |
| `movement-antioch` | Acts 11–12: Jerusalem↔Antioch↔Tarsus, Herod at Caesarea | Barnabas, Paul |
| `journey-1..4` | Paul's missionary journeys + voyage to Rome | **Paul** (+ Barnabas on `journey-1`) |

So the Atlas is largely a **re-organization of existing data around people**, plus new biographical content and a new view. You are not starting from scratch.

---

## 2. CRITICAL environment gotchas (read before building)

This repo lives in a **OneDrive** folder mounted into the sandbox. Three traps:

1. **`node_modules` is only partially materialized in the sandbox** (missing `typescript/lib`, `.bin/`). You can't build in place. Build a clean copy to verify:
   ```bash
   SRC=/sessions/<session>/mnt/Acts-platform        # your real mount path
   DST=/tmp/acts-verify
   rm -rf "$DST"; mkdir -p "$DST"
   cp -r "$SRC"/{src,public,index.html,package.json,tsconfig.json,tsconfig.node.json,vite.config.ts,tailwind.config.js,postcss.config.js} "$DST"/
   cd "$DST" && npm install --no-audit --no-fund     # registry reachable, ~37s
   node node_modules/typescript/bin/tsc -b           # typecheck (NOT npx tsc — installs wrong pkg)
   node node_modules/vite/bin/vite.js build           # production build
   ```
2. **File-tool edits can lag/truncate in the bash view** (OneDrive sync). Git commits from bash, so make bash authoritative: after editing, re-validate in bash (parse JSON, run tsc) and re-write via heredoc if a file looks stale before committing.
3. **No GitHub creds in the sandbox** — `git push` fails. You may `commit` from bash, but **Pastor Fidele pushes from his machine** (GitHub Desktop → Push origin). Tell him exactly what's pending.

**i18n rule that breaks the build:** `t` is typed as `typeof en`, so `rw.json` must contain **every key** `en.json` has (identical shape) or `tsc` fails. Add new keys to **both** files.

---

## 3. The Atlas — UX & integration

**Entry point.** Add an **"Atlas" mode** to the header (a toggle next to the title, e.g. *Walk-through* ⇄ *Atlas*). When Atlas is on:
- **Left pane** → a **figure list** (the 6, as cards/buttons with initials or an icon + one-line tag). Selecting one shows that figure's **biography panel** below the list (or replacing it, with a back arrow).
- **Right pane** → **that figure's dedicated map**: fit to their locations, their ministry path emphasized, their stops clickable, their **birthplace** marked with a distinct gold star, and a clear **"tradition" badge** on any non-Acts content.
- Keep it **one figure at a time**, with prev/next or "back to figures."

This reuses the existing two-pane layout in `App.tsx`. Add an `appMode: 'walkthrough' | 'atlas'` state at the top of `App` and branch the panes. Keep the current Scripture/Teaching/Map experience intact under `walkthrough`.

**The map for a figure.** Two viable approaches:
- **(A, recommended) Extend the existing map.** Add an optional `atlasFigure` prop to `MapPane` (or a thin `AtlasMap` wrapper that reuses its helpers). A figure maps to **one or more** route ids (e.g. Paul = `movement-saul` + `journey-1..4`). You'll need to **emphasize multiple routes at once** and **fit bounds to their combined bbox** — the current map emphasizes a single `activeJourney`. Add an `activeFigureRouteIds: string[]` concept: highlight all of the figure's routes/stops, dim everything else, `map.fitBounds(turf.bbox(featureCollection(theirRoutes)))`.
- **(B) A dedicated lighter `AtlasMap`** that only draws the selected figure's routes/stops + birthplace + bio-linked pins. Cleaner separation, a little duplication.

**Jerusalem-only figures (Stephen, James).** Their whole story is in one city, so a wide route map is wrong. Render a **zoomed Jerusalem inset** using the sub-Jerusalem stops already in `movement-jerusalem` (Upper Room, Solomon's Portico, Sanhedrin, Akeldama, plus add a stoning site for Stephen / temple pinnacle for James). Fit to the Jerusalem bbox at high zoom.

**Birthplaces & "where their life ended"** become per-figure markers on each map (gold star = birthplace, a distinct marker = place of death/martyrdom), both with tradition labels where the source is tradition. (This absorbs the earlier birthplaces request.)

**Reuse these existing MapPane patterns** (`src/components/MapPane.tsx`):
- Sources/layers added once under `if (!map.getSource(...))`; follow the `locations` block (~L131–216) as your template.
- **Popups must read i18n from refs** — `tRef`, `fmtRef`, `langRef` (~L57–64) — or they freeze in one language. Symbol-layer label text is refreshed on language change in a dedicated effect (~L468–476).
- `escapeHtml()` helper (bottom of file) for popup HTML; one reused `popupRef`.
- `map.flyTo(...)` for a point; `map.fitBounds(turf.bbox(...))` for an area.

**Optional add-on (was a separate request): search.** A search box that finds any place by English/Kinyarwanda name and flies to it. Nice complement to the Atlas (jump to a figure or place), but **not core** — implement after the Atlas works. If you do: search the union of journey stops (`name`/`name_rw`), locations (`ancient_name`/`modern_name`), and birthplaces; note `App.tsx` currently passes only panel-filtered `visibleLocations` to the map, so search needs the **full** dataset.

---

## 4. The six figures — content skeleton (Acts refs + tradition)

Author final copy from this. **Scripture = black/navy; tradition = a labeled gold "Tradition" badge.** All strings go in i18n (`t.atlas.figures.<id>.*`) in both en + rw.

### Peter (`peter`)
- **Who:** Galilean fisherman, leader of the Twelve. Birthplace **Bethsaida** (John 1:44); home in **Capernaum** (Mark 1:29). *(Galilee detail is biographical, not from Acts.)*
- **In Acts:** Pentecost sermon, **Jerusalem** (Acts 2); heals at the Beautiful Gate (3); before the Sanhedrin (4–5); to **Samaria** with John (8:14–25); **Lydda** heals Aeneas (9:32–35); **Joppa** raises Tabitha + rooftop vision (9:36–10:23); **Caesarea**, Cornelius — the Gentile Pentecost (10); imprisoned by Herod, angelic escape (12); Jerusalem Council (15).
- **Data:** `movement-peter` + `movement-jerusalem`.
- **Ending (tradition):** ministry in Antioch & Asia Minor (cf. 1 Peter), then **Rome**; martyred by crucifixion (upside-down, per tradition) under Nero, **c. AD 64–67**.

### Paul / Saul (`paul`)
- **Who:** Born in **Tarsus of Cilicia** (Acts 22:3); Roman citizen by birth (22:28); trained in Jerusalem under Gamaliel; Pharisee.
- **In Acts:** consents to Stephen's death (7:58–8:1); persecutor (8:3; 9:1–2); **Damascus road** conversion (9); Arabia & Damascus, escape in a basket (9:23–25; Gal 1:17); Jerusalem (9:26–30); **Tarsus** (9:30); **Antioch** (11:25–26); **three missionary journeys** (13–21); arrest in Jerusalem (21); **Caesarea** 2 yrs (24); voyage & shipwreck to **Rome** (27–28).
- **Data:** `movement-saul` + `journey-1..4` + birthplace Tarsus. (Paul spans the most routes — the multi-route emphasis is essential here.)
- **Ending (tradition):** released c. 62, possibly **Spain** (Rom 15:24; Clement, "limits of the West"); re-arrested; **beheaded** (as a citizen) on the Ostian Way, Rome, **c. AD 64–67**.

### Barnabas (`barnabas`)
- **Who:** **Joseph, a Levite of Cyprus**; the apostles named him Barnabas, "son of encouragement" (Acts 4:36). Sold a field for the church (4:37).
- **In Acts:** vouches for the converted Saul (9:27); sent to **Antioch** (11:22–24); brings Saul from **Tarsus** (11:25–26); famine relief to Jerusalem (11:30); **Journey 1** with Paul — **Cyprus**, Pisidian Antioch, Iconium, Lystra, Derbe (13–14); Council (15); sharp split with Paul over John Mark → takes Mark and sails to **Cyprus** (15:36–39).
- **Data:** `journey-1` + `movement-antioch` + birthplace Cyprus (Salamis `lon 33.9006, lat 35.1814`).
- **Ending (tradition):** continued in **Cyprus**; martyred (stoned) at **Salamis**, **c. AD 61**; traditional tomb at Salamis.

### Philip the Evangelist (`philip`)
- **Who:** one of the **Seven** chosen to serve (Acts 6:5). *(Distinct from Philip the Apostle — say so.)*
- **In Acts:** preaches in **Samaria** with signs; Simon the sorcerer (8:5–13); the **Gaza road** — baptizes the Ethiopian eunuch (8:26–39); caught away to **Azotus**, preaching up the coast to **Caesarea** (8:40); settles in Caesarea — later hosts Paul and has four prophesying daughters (21:8–9).
- **Data:** `movement-philip`.
- **Ending (tradition):** later evangelist; some traditions place his later ministry/death at **Hierapolis** in Phrygia (note the frequent conflation with Philip the Apostle).

### Stephen (`stephen`)
- **Who:** one of the **Seven** (6:5); "full of grace and power."
- **In Acts (all in Jerusalem):** wonders & signs (6:8); disputes with the Synagogue of the Freedmen (6:9); seized, false witnesses, before the **Sanhedrin** (6:11–15); the great speech tracing Israel's story (7); **stoned** outside the city — the **first martyr**; Saul consents and guards the cloaks (7:54–8:1).
- **Data:** Jerusalem inset from `movement-jerusalem` + add a stoning-site point (traditionally just outside the northern wall, near today's Lions'/St. Stephen's Gate).
- **Ending:** martyred **c. AD 34** (Scripture itself records the death).

### James (`james`)
- **Recommendation:** feature **James "the Just," the brother of the Lord** as the primary map, with a clearly-marked secondary card for **James son of Zebedee** (because both matter and both are Jerusalem-centric).
- **James the Just — in Acts:** emerges as leader of the **Jerusalem** church (12:17); presides at the **Jerusalem Council** (15:13–21); receives Paul (21:18). Wrote the Epistle of James. **Ending (tradition, Josephus & Hegesippus):** martyred **c. AD 62** — thrown from the temple pinnacle and clubbed.
- **James son of Zebedee (secondary card):** apostle, brother of John, Galilean fisherman; **first apostle martyred** — executed by the sword by **Herod Agrippa I** in Jerusalem, **c. AD 44** (Acts 12:2). *(This death IS in Acts.)*
- **Data:** Jerusalem inset from `movement-jerusalem` + temple point.

---

## 5. Data model & files to add

- **`src/data/figures.ts`** (committed, the spine of the Atlas):
  ```ts
  export interface AtlasFigure {
    id: 'peter' | 'paul' | 'barnabas' | 'philip' | 'stephen' | 'james';
    routeIds: string[];            // which journeys.geojson routes are "theirs"
    birthplace?: { lon: number; lat: number; tradition?: boolean };
    deathplace?: { lon: number; lat: number; tradition?: boolean };
    jerusalemInset?: boolean;      // true for Stephen, James
    order: number;                 // display order in the picker
    // all human text (name, tagline, bio paragraphs, key events,
    // ending) lives in i18n under t.atlas.figures.<id>, NOT here
  }
  ```
  Key events can reference `acts_ref` strings so the bio can deep-link into the Scripture pane (reuse `App.handleOpenVerse(chapter, verse)`).
- **`src/components/AtlasView.tsx`** — figure picker + selected figure's bio panel (left), drives the map (right). Bilingual via `useT()`.
- **`src/components/AtlasMap.tsx`** *(or extend `MapPane`)* — renders the figure's routes/stops + birthplace/death markers + Jerusalem inset.
- **`App.tsx`** — add `appMode` state + header toggle; branch panes; pass the selected figure down.
- **i18n** — new `t.atlas.*` block (mode label, picker heading, "Scripture"/"Tradition" badges, per-figure name/tagline/bio/key-events/ending) in **both** `en.json` and `rw.json`. Kinyarwanda drafts are fine (Pastor refines later, same posture as the draft Scripture/timeline strings).
- **Where new geography is needed** (author in `scripts/build-journeys.mjs` so it flows through the pipeline, or as small committed points): Stephen's stoning site, James's temple pinnacle, and death-places (Rome for Peter/Paul, Salamis for Barnabas). Keep `[lon, lat]` order.

---

## 6. Build / verify / deploy checklist

1. Build the data spine (`figures.ts`) + i18n, then `AtlasView`, then `AtlasMap`, then wire the header toggle in `App.tsx`.
2. **Verify** in `/tmp/acts-verify` (section 2): `tsc -b` clean **and** `vite build` succeeds.
3. Manual QA: each figure's map fits their locations; multi-route figures (Paul, Peter, Barnabas) show all their routes; Stephen/James use the Jerusalem inset; tradition content is badged; language switch updates bio + popups.
4. `git add -A && git commit` from bash.
5. **Hand the push to Pastor Fidele** (GitHub Desktop → Push origin). Netlify rebuilds in ~1 min; confirm on https://acts.fidelebolton.com.

---

## 7. Decisions still open (confirm with Pastor Fidele)
1. **Atlas entry:** header toggle (recommended) vs. a third left-pane tab vs. a button on the map.
2. **James:** lead with James the Just + a card for James son of Zebedee (recommended), or split them into two figures (→ 7 maps)?
3. **Peter/Paul Galilee & Rome:** include non-Acts biographical geography (Bethsaida, Rome) on their maps? (Recommended yes, clearly badged.)
4. **Figure art:** initials/icon now, real illustrations later?

## 8. Acceptance criteria
- An **Atlas mode** toggles on without disturbing the existing walk-through.
- Selecting any of the **6 figures** shows **their** map (fit to their places, their path emphasized, birthplace starred, death-place marked) **and** a bio panel with Acts-referenced key events and a clearly-**labeled** tradition section.
- Stephen & James render a readable **Jerusalem inset**.
- Fully **bilingual**; popups and bio update on language switch.
- `tsc -b` + `vite build` pass; en/rw i18n shapes match; no regression to the map, timeline, walk-the-journey, or verse↔map features.

---
*Start here: read `src/components/MapPane.tsx` (the `locations` layer + the `tRef/fmtRef/langRef` pattern), `src/types/index.ts`, `scripts/build-journeys.mjs` (see the per-figure movements), and `src/i18n/en.json`. Build `figures.ts` + i18n first, then the picker/bio, then the map. Keep tradition visibly distinct from Scripture throughout — it's a teaching tool for a pastor.*
