#!/usr/bin/env node
/**
 * parse-locations.mjs
 *
 * Reads the OpenBible.info Bible-Geocoding-Data repo (CC-BY-4.0) and
 * extracts only the places mentioned in the Book of Acts, paired with
 * their modern equivalents.
 *
 * Output: data/locations.json — a slim, frontend-ready manifest of
 * Acts-relevant ancient places, each with:
 *   - friendly_id (e.g., "Jerusalem")
 *   - lat / lon (best representative point from modern equivalent)
 *   - modern_name (e.g., "Jerusalem, Israel" or "Antakya, Turkey")
 *   - modern_country, modern_region
 *   - confidence_score (0–1000)
 *   - osises (list of Acts.X.Y references that mention this place)
 *   - chapters_in_acts (set of Acts chapters this place appears in)
 *
 * Input expected at: ../../Bible-Geocoding-Data/
 * (Run `git clone https://github.com/openbibleinfo/Bible-Geocoding-Data.git`
 *  at the project root before running this script. Netlify build does this
 *  via a postinstall step — see netlify.toml.)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '../Bible-Geocoding-Data');
const OUT_PATH = resolve(__dirname, '../public/data/locations.json');

// Standard ISO 3166-1 alpha-2 → English country name mapping for the
// modern locations we care about. We use Wikidata IDs from the dataset's
// linked_data when available, but fall back to coordinate-based inference.
const COUNTRY_BY_COORDS = [
  // Bounding boxes for inference — only used when modern.jsonl doesn't
  // already include country metadata. Order matters: first match wins,
  // so smaller / more specific countries should appear before larger ones.
  // Format: [name, lat_min, lat_max, lon_min, lon_max]
  ['Malta',         35.7, 36.1, 14.1, 14.6],
  ['Cyprus',        34.5, 35.7, 32.2, 34.6],
  ['Syria',         32.3, 37.3, 35.6, 42.4],   // covers Damascus — listed before Lebanon
  ['Lebanon',       33.0, 34.7, 35.1, 36.0],   // tightened east, after Syria
  ['Israel',        29.5, 33.4, 34.2, 35.9],
  ['Palestine',     31.2, 32.6, 34.9, 35.6],
  ['Jordan',        29.2, 33.4, 35.0, 39.3],
  ['Iraq',          29.0, 37.4, 38.8, 48.7],
  ['Egypt',         22.0, 31.7, 24.7, 36.9],
  ['Turkey',        35.8, 42.1, 25.6, 44.8],
  ['Greece',        34.7, 41.8, 19.3, 28.3],
  ['Italy',         36.6, 47.1,  6.7, 18.6],
  ['Saudi Arabia',  16.0, 32.2, 34.5, 55.7],
  ['Iran',          25.0, 39.8, 44.0, 63.3],
  ['Libya',         19.5, 33.2,  9.4, 25.2],
  ['Tunisia',       30.2, 37.5,  7.5, 11.6],
  ['Ethiopia',       3.4, 14.9, 32.9, 47.9],
];

function inferCountry(lat, lon) {
  for (const [name, latMin, latMax, lonMin, lonMax] of COUNTRY_BY_COORDS) {
    if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax) return name;
  }
  return null;
}

function readJSONL(path) {
  const text = readFileSync(path, 'utf-8');
  return text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => JSON.parse(line));
}

function parseGeometryCoords(record) {
  // OpenBible records have a geojson_roles map; the role used for a single
  // point varies by record. Most common: 'point', then 'representative_point'.
  // We try in priority order, then fall back to any Point in the file.
  const roles = record.geojson_roles || {};
  const priorityOrder = ['point', 'representative_point', 'precise', 'geometry'];

  const geoFile = record.geojson_file;
  if (!geoFile) return null;

  const geoPath = resolve(REPO, 'geometry', geoFile);
  if (!existsSync(geoPath)) return null;

  let geo;
  try {
    geo = JSON.parse(readFileSync(geoPath, 'utf-8'));
  } catch {
    return null;
  }

  // Try each priority role
  for (const roleName of priorityOrder) {
    const role = roles[roleName];
    if (role?.id) {
      const pt = extractPointFromGeoJSON(geo, role.id);
      if (pt) return pt;
    }
  }

  // Fall back to ANY Point or Polygon centroid in the file
  return extractAnyPoint(geo);
}

function extractPointFromGeoJSON(geo, targetId) {
  if (geo.type === 'FeatureCollection') {
    for (const feat of geo.features || []) {
      if (feat.id === targetId && feat.geometry?.type === 'Point') {
        return feat.geometry.coordinates;
      }
    }
  } else if (geo.type === 'Feature' && geo.id === targetId && geo.geometry?.type === 'Point') {
    return geo.geometry.coordinates;
  }
  return null;
}

function extractAnyPoint(geo) {
  // Walk the GeoJSON and pull any usable lat/lon — Point first,
  // then centroid-of-polygon as last resort.
  const features =
    geo.type === 'FeatureCollection' ? geo.features :
    geo.type === 'Feature' ? [geo] : [];

  // Pass 1: any Point
  for (const feat of features) {
    if (feat.geometry?.type === 'Point') return feat.geometry.coordinates;
  }
  // Pass 2: any Polygon — use first ring's first vertex (good enough)
  for (const feat of features) {
    const g = feat.geometry;
    if (g?.type === 'Polygon' && g.coordinates?.[0]?.[0]) {
      return centroidOfRing(g.coordinates[0]);
    }
    if (g?.type === 'MultiPolygon' && g.coordinates?.[0]?.[0]?.[0]) {
      return centroidOfRing(g.coordinates[0][0]);
    }
    if (g?.type === 'LineString' && g.coordinates?.length) {
      const mid = Math.floor(g.coordinates.length / 2);
      return g.coordinates[mid];
    }
  }
  return null;
}

function centroidOfRing(ring) {
  let sumLon = 0, sumLat = 0;
  for (const [lon, lat] of ring) {
    sumLon += lon;
    sumLat += lat;
  }
  return [sumLon / ring.length, sumLat / ring.length];
}

function main() {
  console.log('🗺️  Parsing OpenBible.info data for Acts-only locations');
  console.log();

  if (!existsSync(REPO)) {
    console.error(`❌ OpenBible repo not found at ${REPO}`);
    console.error('   Run: git clone https://github.com/openbibleinfo/Bible-Geocoding-Data.git');
    process.exit(1);
  }

  const ancient = readJSONL(resolve(REPO, 'data/ancient.jsonl'));
  const modern  = readJSONL(resolve(REPO, 'data/modern.jsonl'));

  console.log(`   • ${ancient.length} ancient places`);
  console.log(`   • ${modern.length} modern locations`);

  const modernById = new Map(modern.map(m => [m.id, m]));

  // Filter ancient places that have any Acts.X.Y reference in extra.osises
  const actsLocations = [];

  for (const rec of ancient) {
    let extra;
    try { extra = JSON.parse(rec.extra || '{}'); } catch { continue; }
    const osises = extra.osises || [];
    const actsRefs = osises.filter(o => o.startsWith('Acts.'));
    if (actsRefs.length === 0) continue;

    // Pick the best (highest scoring) modern identification
    const identifications = rec.identifications || [];
    let best = null;
    for (const id of identifications) {
      if (id.id_source === 'modern') {
        const resolutions = id.resolutions || [];
        const top = resolutions.reduce((a, b) =>
          ((a?.best_path_score ?? 0) > (b?.best_path_score ?? 0) ? a : b),
        null);
        if (!best || (top?.best_path_score ?? 0) > (best.score ?? 0)) {
          best = {
            modernId: id.id,
            score: top?.best_path_score ?? 0,
            resolution: top,
            identification: id,
          };
        }
      }
    }

    // Resolve coordinates from the modern location
    let lat = null, lon = null, modernName = null;
    if (best?.modernId) {
      const modernRec = modernById.get(best.modernId);
      if (modernRec) {
        modernName = modernRec.friendly_id;
        const coords = parseGeometryCoords(modernRec);
        if (coords) {
          [lon, lat] = coords;
        }
      }
    }

    // Fallback: pull from ancient's own geometry if no modern point
    if (lat === null) {
      const coords = parseGeometryCoords(rec);
      if (coords) {
        [lon, lat] = coords;
      }
    }

    if (lat === null || lon === null) continue;

    // Acts chapter set
    const chaptersInActs = new Set();
    const versesInActs = [];
    for (const ref of actsRefs) {
      const m = ref.match(/^Acts\.(\d+)\.(\d+)$/);
      if (m) {
        chaptersInActs.add(parseInt(m[1], 10));
        versesInActs.push({ chapter: parseInt(m[1], 10), verse: parseInt(m[2], 10) });
      }
    }

    actsLocations.push({
      id: rec.id,
      friendly_id: rec.friendly_id,
      ancient_name: rec.friendly_id,
      modern_name: modernName,
      modern_country: inferCountry(lat, lon),
      lat,
      lon,
      confidence_score: best?.score ?? 0,
      osis_refs: actsRefs,
      chapters_in_acts: Array.from(chaptersInActs).sort((a, b) => a - b),
      verses_in_acts: versesInActs.sort((a, b) =>
        a.chapter - b.chapter || a.verse - b.verse,
      ),
      // OpenStreetMap link for users who want to dig deeper
      osm_url: `https://www.openstreetmap.org/?mlat=${lat.toFixed(4)}&mlon=${lon.toFixed(4)}#map=10/${lat.toFixed(4)}/${lon.toFixed(4)}`,
    });
  }

  // Sort: chapter where first mentioned, then by Acts verse number
  actsLocations.sort((a, b) => {
    const aFirst = a.chapters_in_acts[0] || 99;
    const bFirst = b.chapters_in_acts[0] || 99;
    return aFirst - bFirst || a.friendly_id.localeCompare(b.friendly_id);
  });

  const payload = {
    license: 'CC-BY-4.0 (OpenBible.info)',
    attribution: 'Bible-Geocoding-Data by OpenBible.info — https://www.openbible.info/geo/',
    coordinateSystem: 'EPSG:4326 (WGS 84)',
    count: actsLocations.length,
    locations: actsLocations,
    generatedAt: new Date().toISOString(),
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));

  console.log();
  console.log(`✅ Wrote ${OUT_PATH}`);
  console.log(`   • ${actsLocations.length} Acts-relevant locations`);
  console.log();
  console.log('Sample (first 8 by chapter order):');
  for (const loc of actsLocations.slice(0, 8)) {
    const chapters = loc.chapters_in_acts.join(',');
    console.log(`   - ${loc.ancient_name.padEnd(22)} → ${(loc.modern_name || '?').padEnd(28)} (${loc.modern_country || '?'}) [Acts ${chapters}]`);
  }
}

main();
