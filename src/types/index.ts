/**
 * Shared types — generated to match the data pipeline outputs in /scripts.
 * Keep this file in sync with scripts/fetch-bsb.mjs, parse-locations.mjs,
 * and build-journeys.mjs.
 */

// ─── BSB Scripture Text ───────────────────────────────────────────────

export interface ScripturePayload {
  translation: {
    id: string;
    name: string;
    shortName: string;
    website: string;
    licenseUrl: string;
    language: string;
  };
  book: {
    id: 'ACT';
    name: 'Acts';
    commonName: 'Acts of the Apostles';
    numberOfChapters: 28;
    totalNumberOfVerses: number;
  };
  panels: Panel[];
  chapters: Chapter[];
  fetchedAt: string;
}

export interface Panel {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  startChapter: number;
  startVerse: number;
  endChapter: number;
  endVerse: number;
}

export interface Chapter {
  number: number;
  panel: 1 | 2 | 3 | 4 | 5 | 6;
  content: ChapterBlock[];
  footnotes: Footnote[];
  audio: Record<string, string>; // reader name → mp3 url
}

export type ChapterBlock = HeadingBlock | VerseBlock;

export interface HeadingBlock {
  type: 'heading';
  text: string;
}

export interface VerseBlock {
  type: 'verse';
  chapter: number;
  number: number;
  text: string;        // plain text (for search, accessibility)
  html: string;        // rendered HTML (with words-of-jesus spans, footnote refs)
  panel: 1 | 2 | 3 | 4 | 5 | 6;
  id: string;          // "act-1-19"
}

export interface Footnote {
  id: number;
  text: string;
  caller: string | null;
  ref?: { chapter: number; verse: number };
}

// ─── Locations ────────────────────────────────────────────────────────

export interface LocationsPayload {
  license: string;
  attribution: string;
  coordinateSystem: 'EPSG:4326 (WGS 84)';
  count: number;
  locations: ActsLocation[];
  generatedAt: string;
}

export interface ActsLocation {
  id: string;
  friendly_id: string;
  ancient_name: string;
  modern_name: string | null;
  modern_country: string | null;
  lat: number;
  lon: number;
  confidence_score: number;
  osis_refs: string[];        // e.g. ["Acts.13.6", "Acts.13.13"]
  chapters_in_acts: number[];
  verses_in_acts: { chapter: number; verse: number }[];
  osm_url: string;
}

// ─── Journeys (GeoJSON) ───────────────────────────────────────────────

export interface JourneysCollection {
  type: 'FeatureCollection';
  name: string;
  crs: unknown;
  metadata: {
    journeys: number;
    total_stops: number;
    attribution: string;
    generatedAt: string;
  };
  features: (RouteFeature | StopFeature)[];
}

export interface RouteFeature {
  type: 'Feature';
  id: string;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: {
    kind: 'route';
    journey_id: string;
    name: string;
    period: string;
    acts_range: string;
    color: string;
    narrative: string;
    stop_count: number;
  };
}

export interface StopFeature {
  type: 'Feature';
  id: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    kind: 'stop';
    journey_id: string;
    journey_name: string;
    color: string;
    sequence: number;
    total_stops: number;
    name: string;
    acts_ref: string;
    notes: string;
  };
}

// ─── Teaching content (your PSOS lessons, articles, sermons) ──────────

export interface TeachingEntry {
  id: string;                          // "lesson-1-acts-1"
  type: 'psos-lesson' | 'article' | 'sermon' | 'devotional' | 'book-section';
  title: string;
  subtitle?: string;
  chapter: number;                     // 1–28
  verseRange?: { start: number; end: number };
  panel: 1 | 2 | 3 | 4 | 5 | 6;
  big_idea?: string;
  key_verses?: { kw: string; ts: string }; // Know the Word | Trust the Spirit
  content_md: string;                  // markdown body
  source_file?: string;                // original docx, for traceability
  excerpt?: string;                    // short preview
}

// ─── Timeline events ─────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  year: string;                        // "AD 30", "AD 49"
  date_approx: string;                 // human-readable
  title: string;
  description: string;
  chapter: number;
  panel: 1 | 2 | 3 | 4 | 5 | 6;
  location_ids?: string[];             // → locations.json ids
  journey_id?: string;                 // → journeys.geojson id
}

// ─── UI state ─────────────────────────────────────────────────────────

export interface AppState {
  activeChapter: number;
  activeVerse: number | null;
  activePanel: 1 | 2 | 3 | 4 | 5 | 6;
  activeJourney: string | null;
  showCommentary: boolean;
  showTimeline: boolean;
}
