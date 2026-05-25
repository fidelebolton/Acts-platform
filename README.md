# The Book of Acts — Interactive Walk-Through

An interactive teaching platform for the Book of Acts, built for
**Pastor Fidele Bolton** (fidelebolton.com) and Potter's Wheel Church.

**Live:** [acts.fidelebolton.com](https://acts.fidelebolton.com)
**Series:** *Know the Word · Trust the Spirit · Preach the Name*

---

## What this is

A six-panel walk-through of Acts 1–28 with synchronized scripture, maps,
and pastoral teaching:

- **Scripture** — Berean Standard Bible (public domain), all 28 chapters,
  pulled fresh from the [HelloAO Free Use Bible API](https://bible.helloao.org/) at build time.
- **Maps** — every place in Acts (107 locations) mapped to its modern
  equivalent, rendered with MapLibre GL JS. Click a marker to see
  ancient ↔ modern names, country, and Acts chapters where it appears.
- **Journeys** — Paul's four journeys animated as routes, with all 65 stops
  carrying Acts references and pastoral notes.
- **Teaching** — Pastor Fidele's PSOS lessons, articles from
  *Know the Word | Trust the Spirit*, sermons, and devotionals — paneled
  to match the scripture you're reading.
- **Timeline** — AD 30 → AD 62, click any milestone to jump.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (navy / gold / cream — the Potter's Wheel design system)
- MapLibre GL JS (open-source WebGL maps)
- Turf.js (spatial calculations)
- react-markdown (renders teaching content)
- Mammoth (.docx → Markdown for PSOS lessons)
- Deployed on Netlify

**No backend.** Everything is static. All dynamic data is baked into JSON
at build time. Build is reproducible, deploys in ~2 minutes.

## Repository layout

```
acts-platform/
├── public/
│   ├── favicon.svg
│   └── data/                          ← generated at build time
│       ├── bsb-acts.json              (BSB Acts 1–28, ~1,000 verses)
│       ├── locations.json             (107 Acts places, modern equivalents)
│       ├── journeys.geojson           (4 journeys, 65 stops)
│       └── teachings/
│           ├── index.json             (manifest of all teaching entries)
│           ├── sources/               ← drop pre-authored .md here
│           └── *.md                   ← generated from .docx
├── scripts/
│   ├── fetch-bsb.mjs                  ← pulls BSB from HelloAO
│   ├── parse-locations.mjs            ← Acts-filtered OpenBible data
│   ├── build-journeys.mjs             ← Paul's journey GeoJSON
│   └── convert-teachings.mjs          ← PSOS .docx → Markdown
├── src/
│   ├── App.tsx                        ← 3-pane shell + state
│   ├── main.tsx                       ← entry point
│   ├── types/                         ← shared TypeScript types
│   ├── components/
│   │   ├── PanelNav.tsx               ← six-panel pill nav
│   │   ├── ScripturePane.tsx          ← BSB with scroll-sync to map
│   │   ├── MapPane.tsx                ← MapLibre + journeys
│   │   ├── TeachingPane.tsx           ← lessons / articles
│   │   └── TimelineBar.tsx            ← AD 30–62 chronology
│   └── styles/globals.css             ← Tailwind base + custom
├── netlify.toml                       ← build pipeline
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Working with content

### Adding / updating PSOS lessons

1. Drop your `.docx` lesson files into `/uploads/` (or pass paths as
   CLI args to the script).
2. Run `npm run data:teachings`.
3. The script extracts Big Idea, Key Verses (Know the Word / Trust the Spirit),
   and the body, writes per-lesson `.md` files, and rebuilds `index.json`.
4. The TeachingPane picks them up automatically — paneled by Acts chapter.

### Adding articles, sermons, devotionals

Drop a Markdown file into `public/data/teachings/sources/` with this front-matter:

```markdown
---
id: holy-spirit-acts-2
type: article
title: The Holy Spirit in Acts 2
subtitle: A Divine Person, His Gifts, and His Fruit
chapter: 2
---

Article content in markdown here...
```

`type` can be: `psos-lesson`, `article`, `sermon`, `devotional`, `book-section`.
`chapter` is the Acts chapter; the panel (1–6) is auto-derived.

Then run `npm run data:teachings`.

### Regenerating everything

```sh
npm run data         # all three data pipelines
npm run data:bsb     # just BSB
npm run data:locations
npm run data:journeys
npm run data:teachings
```

## Local development

```sh
npm install
npm run data         # populates public/data/*
npm run dev          # http://localhost:5173
```

## Deploying

Netlify auto-deploys on every push to GitHub. The `netlify.toml` in the
repo root tells Netlify to:

1. Clone OpenBible.info Bible-Geocoding-Data (CC-BY-4.0)
2. Run `npm run data` (which fetches the BSB and rebuilds all JSON)
3. Run `npm run build` (Vite production bundle)
4. Publish `dist/`

Custom domain `acts.fidelebolton.com` is configured in Netlify DNS.

## Copyright & licenses

- **Berean Standard Bible** — public domain (April 30, 2023). Sourced via
  HelloAO Free Use Bible API (MIT-licensed code).
- **OpenBible.info geocoding data** — CC-BY-4.0. Attributed in-footer.
- **OpenStreetMap base tiles** — ODbL. Attributed automatically by MapLibre.
- **Pastoral teaching content** — © Fidele Bolton. All rights reserved.
- **Code** — © Fidele Bolton, deployed on Netlify.

External scholarship (Keener, Witherington, Bruce, Bock) is referenced
by name and link only — no copyrighted content is embedded.

## Credits

Built with deep care for the body of Christ.
*"Freely you have received; freely give." — Matthew 10:8*
