# Acts Platform — Translation Handoff

This document is everything another developer or AI assistant needs to translate the Acts Platform (https://acts.fidelebolton.com) into another language — currently Kinyarwanda is the priority.

It is self-contained: you can paste this into ChatGPT, hand it to a developer, or just read it through to understand the project.

---

## 1. Source code access (no auth required)

The full source is **public on GitHub**:

```
https://github.com/fidelebolton/Acts-platform
```

Anyone — human or AI — can clone it without credentials:

```bash
git clone https://github.com/fidelebolton/Acts-platform.git
cd Acts-platform
```

To submit changes back: open a pull request against `main`, or send the changed files to Pastor Fidele and he will commit them via GitHub Desktop.

---

## 2. Folder structure

```
Acts-platform/
├── README.md
├── TRANSLATION_HANDOFF.md          ← this file
├── netlify.toml                    ← Netlify build pipeline
├── package.json                    ← deps + npm scripts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js              ← brand colors (navy/gold/cream)
├── postcss.config.js
├── vite.config.ts
├── .gitignore
├── index.html                      ← page <title>, lang attribute
│
├── public/
│   ├── favicon.svg
│   └── data/                       ← regenerated at build time (gitignored)
│       ├── bsb-acts.json           ← Scripture text + panel definitions
│       ├── locations.json          ← 107 Acts locations from OpenBible
│       ├── journeys.geojson        ← 9 routes (5 movements + 4 Pauline)
│       └── teachings/
│           ├── index.json          ← teaching content manifest
│           └── sources/            ← author drops .md files here (committed)
│
├── scripts/
│   ├── fetch-bsb.mjs               ← pulls Scripture from HelloAO at build time
│   ├── parse-locations.mjs         ← extracts Acts locations from OpenBible repo
│   ├── build-journeys.mjs          ← hand-coded 9 routes + 99 stops + pastoral notes
│   └── convert-teachings.mjs       ← .docx → Markdown for the teaching pane
│
└── src/
    ├── main.tsx                    ← React entry point
    ├── App.tsx                     ← three-pane shell, header, footer
    ├── types/
    │   └── index.ts                ← TypeScript types for all data shapes
    ├── components/
    │   ├── PanelNav.tsx            ← six-panel pill nav (Jerusalem → Rome)
    │   ├── ScripturePane.tsx       ← BSB text with scroll sync
    │   ├── MapPane.tsx             ← MapLibre map + journey legend
    │   ├── TeachingPane.tsx        ← lessons grouped by panel
    │   └── TimelineBar.tsx         ← AD 30–62 chronology with 15 events
    └── styles/
        └── globals.css             ← Tailwind base + custom verse/callout styles
```

---

## 3. Netlify deployment details

| Setting | Value |
|---|---|
| Project / site name | `acts-platform` |
| Production URL | `https://acts.fidelebolton.com` |
| Default Netlify URL | `https://acts-platform.netlify.app` |
| Team | `fidele-bolton` |
| Source repo | `github.com/fidelebolton/Acts-platform`, branch `main` |
| Framework | Vite (auto-detected) |
| Node version | **20** (set in `netlify.toml` under `[build.environment]`) |
| Build command | See below — defined in `netlify.toml` |
| Publish directory | `dist` |
| Environment variables | **None required.** All data is fetched at build time. |
| Functions / Edge functions | **None.** Pure static site. |

The build command (from `netlify.toml`):

```sh
rm -rf Bible-Geocoding-Data && \
git clone --depth 1 https://github.com/openbibleinfo/Bible-Geocoding-Data.git && \
npm run data && \
npm run build
```

Auto-publishing is **on**: every push to `main` triggers a new build (~20–40 seconds).

Headers from `netlify.toml`:
- `/data/*` → `Cache-Control: public, max-age=86400, must-revalidate`
- `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`
- Catch-all `200` redirect from `/*` → `/index.html` (SPA-style fallback)

---

## 4. Running the site locally

Prerequisites: Node 20+ and Git.

```bash
# 1. Get the code
git clone https://github.com/fidelebolton/Acts-platform.git
cd Acts-platform

# 2. Install dependencies
npm install

# 3. Clone the OpenBible geocoding data (one-time, used by parse-locations.mjs)
git clone --depth 1 https://github.com/openbibleinfo/Bible-Geocoding-Data.git

# 4. Build all data files (Scripture, locations, journeys)
npm run data
#    └─ runs: data:bsb (fetches BSB from HelloAO API)
#             data:locations (parses OpenBible → 107 Acts locations)
#             data:journeys (writes 9 routes / 99 stops to GeoJSON)

# 5. Dev server with hot reload
npm run dev
#    └─ opens http://localhost:5173

# 6. Production build (for inspection or manual deploy)
npm run build

# 7. Preview the production build locally
npm run preview
```

Individual data steps if you only need one:

```bash
npm run data:bsb        # pull Scripture only
npm run data:locations  # rebuild locations only
npm run data:journeys   # rebuild journeys only
npm run data:teachings  # convert .docx in /uploads → .md sources
```

The data pipeline writes to `public/data/*.json` and `public/data/journeys.geojson`. Those files are gitignored on purpose — they regenerate on every build.

---

## 5. Adding a new language — Kinyarwanda walkthrough

The site has **no i18n infrastructure today**. All text is English and hardcoded in either React components or data scripts. To add Kinyarwanda you will need to do three things:

1. Translate the **UI strings** (in `src/`)
2. Translate the **data strings** (panel names, scripture, journey stop names and notes, timeline)
3. Add a **language selector** so visitors can switch

Below is a concrete plan.

### 5a. Where every visible string lives

| What the visitor sees | Source | Notes |
|---|---|---|
| Page `<title>` "The Book of Acts — A Walk-Through \| Pastor Fidele Bolton" | `index.html` | also `<html lang="en">` — change to `lang="rw"` per page |
| Header h1 "The Book of Acts" | `src/App.tsx` line ~96 | hardcoded |
| Tagline "Know the Word · Trust the Spirit · Preach the Name" | `src/App.tsx` line ~99 | hardcoded; this is the PSOS series motto |
| "Pastor Fidele Bolton" + link | `src/App.tsx` lines 103–104 | name shouldn't translate; the role label could |
| "Loading scripture, locations, journeys…" | `src/App.tsx` line ~66 | hardcoded |
| Error states ("Couldn't load the data", "Run npm run data…") | `src/App.tsx` lines 77–82 | hardcoded |
| Panel pill labels — "Jerusalem", "Judea and Samaria", "To the Gentiles", "Asia Minor", "Europe", "Rome — to the Ends of the Earth" | `public/data/bsb-acts.json` → `panels[].name` | **DATA, not UI.** Set in `scripts/fetch-bsb.mjs` (the PANELS array near the top of the file). |
| Tabs "Scripture" / "Teaching" | `src/App.tsx` lines 123, 129 | hardcoded |
| Scripture pane "PANEL X OF 6", chapter labels, verse superscripts | `src/components/ScripturePane.tsx` + `bsb-acts.json` | "PANEL X OF 6" is UI; verse text + section headings ("Prologue", "The Ascension", etc.) come from the BSB feed |
| Map legend header "PAUL'S JOURNEYS" | `src/components/MapPane.tsx` | hardcoded; should be renamed anyway since the legend now covers Acts 1–28 |
| Map legend entries "All locations", "Jerusalem and the Early Church", "Philip and the Scattered Church", "Saul's Conversion", "Peter to the Gentiles", "Antioch and Herod", "First/Second/Third Missionary Journey", "Voyage to Rome" | `public/data/journeys.geojson` (generated from `scripts/build-journeys.mjs`) | "All locations" is hardcoded UI in MapPane.tsx; route names come from data |
| Map popups: stop names, Acts references, pastoral notes for each of 99 stops | `scripts/build-journeys.mjs` → JOURNEYS array | pastoral notes are written in Pastor Fidele's voice — translate carefully |
| Map labels for cities (Antakya, Damascus, Cyprus, etc.) | OpenStreetMap tile data | already multilingual; OpenFreeMap shows local-script labels alongside Latin |
| Teaching pane "TEACHING", "Pastoral teaching coming soon", "Big Idea", "Know the Word", "Trust the Spirit", "PSOS Lesson", "Sermon", "Devotional", "Teaching Article", "From: Know the Word \| Trust the Spirit", "For the builder:", placeholder steps | `src/components/TeachingPane.tsx` lines ~36–149 | mix of hardcoded UI labels and front-matter labels |
| Timeline header "Chronology · AD 30 → AD 62", "Click any event to jump there" | `src/components/TimelineBar.tsx` lines 53, 56 | hardcoded |
| 15 timeline event titles ("Pentecost", "Stephen martyred", "Saul converted", "Cornelius and his household", "Herod Agrippa I dies", "First Journey begins", "Jerusalem Council", "Second Journey begins", "Macedonian Vision", "Areopagus Sermon", "Third Journey begins", "Riot of the silversmiths", "Paul arrested in Jerusalem", "Voyage to Rome", "Rome — house arrest") and 15 short blurbs | `src/components/TimelineBar.tsx` TIMELINE_EVENTS array, lines 14–30 | each event has `title` and `blurb` — both need translation |
| Footer "Scripture: Berean Standard Bible (BSB) · public domain" | `src/App.tsx` line ~169 | the translation NAME comes from `bsb-acts.json.translation.name` — when you switch the BSB feed to a Kinyarwanda translation, this changes automatically. The word "Scripture:" is hardcoded UI. |
| Footer "Locations: Bible-Geocoding-Data by OpenBible.info" | `public/data/locations.json` → `attribution` field | set in `scripts/parse-locations.mjs` |
| Footer "Potter's Wheel Church · potterswheelchurch.com" | `src/App.tsx` line ~175 | "Potter's Wheel Church" is the legal church name — Kinyarwanda equivalent may exist (e.g. "Itorero Potter's Wheel") but check with Pastor Fidele |
| Future teaching content (PSOS lessons, articles, sermons, devotionals) | `public/data/teachings/sources/*.md` | each .md has YAML front-matter + body — produce a Kinyarwanda copy of each file |

### 5b. Recommended i18n approach

Two viable patterns. **Pattern A is simpler and recommended for v1 of the translation.**

#### Pattern A — language-keyed JSON files + a React Context (lightweight)

1. **Add a `src/i18n/` folder** with one JSON per language:

   ```
   src/i18n/
   ├── en.json
   └── rw.json   ← Kinyarwanda
   ```

   Each file mirrors the same keys. Example shape (use whatever keys make sense):

   ```jsonc
   {
     "app": {
       "title": "The Book of Acts",
       "tagline": "Know the Word · Trust the Spirit · Preach the Name",
       "loading": "Loading scripture, locations, journeys…",
       "errorTitle": "Couldn't load the data",
       "scriptureTab": "Scripture",
       "teachingTab": "Teaching",
       "scriptureLabel": "Scripture",
       "locationsLabel": "Locations"
     },
     "map": {
       "legendHeader": "Movements & Journeys",
       "allLocations": "All locations"
     },
     "teaching": {
       "section": "TEACHING",
       "comingSoonTitle": "Pastoral teaching coming soon",
       "bigIdea": "Big Idea",
       "knowTheWord": "Know the Word",
       "trustTheSpirit": "Trust the Spirit",
       "typeLabel": {
         "psos-lesson": "PSOS Lesson",
         "article": "Teaching Article",
         "sermon": "Sermon",
         "devotional": "Devotional",
         "book-section": "From: Know the Word | Trust the Spirit"
       }
     },
     "timeline": {
       "header": "Chronology · AD 30 → AD 62",
       "hint": "Click any event to jump there"
     }
   }
   ```

   The Kinyarwanda file (`rw.json`) has the same keys with translated values.

2. **Create `src/i18n/LanguageContext.tsx`**:

   ```tsx
   import { createContext, useContext, useState, type ReactNode } from 'react';
   import en from './en.json';
   import rw from './rw.json';

   const DICTIONARIES = { en, rw } as const;
   type Lang = keyof typeof DICTIONARIES;

   const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: typeof en }>({
     lang: 'en', setLang: () => {}, t: en,
   });

   export function LanguageProvider({ children }: { children: ReactNode }) {
     const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');
     const t = DICTIONARIES[lang];
     const set = (l: Lang) => { setLang(l); localStorage.setItem('lang', l); };
     return <Ctx.Provider value={{ lang, setLang: set, t }}>{children}</Ctx.Provider>;
   }

   export const useT = () => useContext(Ctx);
   ```

3. **Wrap App in `<LanguageProvider>` in `src/main.tsx`**, then use `const { t } = useT()` inside every component, replacing hardcoded strings with `{t.app.title}` etc.

4. **Add a language selector** to the header (in `src/App.tsx`):

   ```tsx
   const { lang, setLang } = useT();
   <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'rw')}>
     <option value="en">English</option>
     <option value="rw">Kinyarwanda</option>
   </select>
   ```

#### Pattern B — `react-i18next` (industry standard, more features)

If the project is likely to grow to many languages, install `react-i18next`:

```bash
npm install react-i18next i18next
```

…and follow the standard react-i18next setup. Otherwise Pattern A is enough.

### 5c. Translating the data (panels, journeys, timeline)

The data layer is more involved than the UI layer. Three options:

**Option 1 — runtime selection (cleanest, more code).** Make every data file language-keyed:

```jsonc
// public/data/journeys.geojson — extend per-feature properties
{
  "properties": {
    "name": { "en": "Jerusalem and the Early Church", "rw": "Yerusalemu n'Itorero rya Mbere" },
    "narrative": { "en": "…", "rw": "…" }
  }
}
```

Then your components select the active language at render time. This requires edits to `scripts/build-journeys.mjs`, `scripts/fetch-bsb.mjs`, and the components that consume the data.

**Option 2 — separate files per language (simpler, larger payload).** Build separate `journeys.en.geojson` and `journeys.rw.geojson` and let the language context pick which to fetch:

```ts
fetch(`/data/journeys.${lang}.geojson`)
```

This is the path of least resistance and what most static sites do.

**Option 3 — overlay file (smallest diff).** Keep English data as canonical, add a `translations.rw.json` keyed by feature id (e.g. `"movement-jerusalem-stop-1": { "name": "…", "notes": "…" }`), and merge at render time. Good if Kinyarwanda is a partial translation that may not cover every stop initially.

Either way, the strings to translate in the data layer are:

- `scripts/fetch-bsb.mjs` — the **panel names** in the PANELS constant (6 panel names: Jerusalem, Judea and Samaria, To the Gentiles, Asia Minor, Europe, Rome — to the Ends of the Earth)
- `scripts/build-journeys.mjs` — **9 route names**, 9 route narratives, **99 stop names**, 99 short pastoral notes, the FeatureCollection name
- `src/components/TimelineBar.tsx` — **15 event titles + 15 blurbs** in the `TIMELINE_EVENTS` constant. Move these into the i18n JSON files (keep `year`, `panel`, `chapter`, `journey` in code).

### 5d. Kinyarwanda Scripture text

The current build fetches the English BSB from the free HelloAO API:

```
https://bible.helloao.org/api/BSB/ACT/{chapter}.json
```

To get a Kinyarwanda Bible, first check what HelloAO has:

```
https://bible.helloao.org/api/available_translations.json
```

Search for `language: "kin"` (ISO 639-3 code for Kinyarwanda) or `language: "rw"`. If a Kinyarwanda Acts is available, find its translation id (probably `KIN` or similar) and change `scripts/fetch-bsb.mjs`:

```js
// near the top of the file
const TRANSLATION = process.env.BIBLE_TRANSLATION || 'BSB';  // default English BSB
const URL = `https://bible.helloao.org/api/${TRANSLATION}/ACT/{chapter}.json`;
```

Then run:

```bash
BIBLE_TRANSLATION=KIN npm run data:bsb
```

…or set a Netlify environment variable. To support both languages simultaneously, output two files — `bsb-acts.en.json` and `bsb-acts.rw.json` — and let the language selector pick which one to fetch.

If HelloAO does not have Kinyarwanda Acts, alternatives:
- **YouVersion API** (requires API key, has many Kinyarwanda translations including *Bibiliya Yera*)
- **STEPBible** open data
- **Manual import** of a public-domain Kinyarwanda Acts text file into `scripts/fetch-bsb.mjs` (most reliable if licensing allows)

Check with Pastor Fidele which Kinyarwanda translation he wants the platform to use — *Bibiliya Yera* is widely accepted in Rwandan churches.

### 5e. Translating teaching content

Future teaching content (`public/data/teachings/sources/*.md`) is added one PSOS lesson, article, or sermon at a time. For each piece:

1. Author the English `.md` first (Pastor Fidele's voice).
2. Create a Kinyarwanda sibling: same filename with a `.rw.md` suffix, OR use a subfolder `sources/rw/`.
3. Update the front-matter `id` field to include the language (e.g. `id: psos-acts-1.rw`).
4. The `TeachingPane` then loads the file matching the active language.

This work happens **after** the UI/data translation is in place.

---

## 6. Suggested order of work

For an AI assistant translating from scratch:

1. **UI strings first** (Pattern A i18n above) — quick win, smallest code change, lets you ship a Kinyarwanda UI with English content within a day.
2. **Panel names + journey legend** (small data layer changes).
3. **Timeline events** (15 short items, low risk).
4. **Pauline journey + early-church movement notes** (99 stops × short notes — substantive but mechanical).
5. **Scripture text** — switch the BSB feed to a Kinyarwanda translation. Verify HelloAO availability first.
6. **Teaching content** — translate each `.md` file alongside its English counterpart.

After every step: commit to a branch, push, watch Netlify build, verify on the preview URL Netlify generates per branch.

---

## 7. Brand and style preservation

Do not change:
- Color palette: navy `#1B2A4A`, gold `#C9A84C`, cream `#FDF8F0` (defined in `tailwind.config.js`).
- Fonts: Georgia (headings), Calibri (body), Cardo for Scripture (Google Fonts, loaded in `index.html`).
- The six-panel narrative structure or its chapter ranges.
- The 9-route map structure.

Do consider:
- Kinyarwanda needs slightly more horizontal space than English in some places — test that the header, panel pills, and legend don't wrap awkwardly.
- The Cardo font supports Latin characters with diacritics common in Kinyarwanda; no font swap needed.

---

## 8. Contact and decisions

The platform was built for Pastor Fidele Bolton (fidelebolton.com) for use in his teaching ministry and the Potter's Wheel Church Knowing God Missions (KGM) family. Any pastoral wording choices in Kinyarwanda should go through him directly — especially:

- The Kinyarwanda equivalent of the PSOS motto "Know the Word · Trust the Spirit · Preach the Name"
- Whether timeline event titles should be theological (e.g. "Pentekositi") or descriptive (e.g. "Uburezi bw'Umwuka")
- The voice / register for the 99 stop notes (formal vs. pastoral colloquial)

---

*Last updated: 2026-05-26. Prepared for any AI assistant or developer continuing the translation work.*
