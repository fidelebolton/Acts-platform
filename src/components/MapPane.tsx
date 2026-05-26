import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Popup } from 'maplibre-gl';
import * as turf from '@turf/turf';
import type { ActsLocation, JourneysCollection, Panel, RouteFeature } from '../types';
import { useT } from '../i18n/LanguageContext';

interface Props {
  locations: ActsLocation[];
  journeys: JourneysCollection;
  activeJourney: string | null;
  onJourneySelect: (id: string | null) => void;
  activePanel: Panel['id'];
}

// Open, no-API-key OSM-based vector tiles — parchment-tinted via paint
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

export function MapPane({ locations, journeys, activeJourney, onJourneySelect, activePanel }: Props) {
  const { t, fmt, journeyName } = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // MapLibre click handlers are registered once and capture their closure.
  // Mirror the latest i18n strings into refs so popup HTML always renders
  // in the currently-selected language (even after the user switches).
  const tRef = useRef(t);
  const fmtRef = useRef(fmt);
  useEffect(() => {
    tRef.current = t;
    fmtRef.current = fmt;
  }, [t, fmt]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [30, 36],   // Eastern Mediterranean center
      zoom: 4.2,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
      mapRef.current = map;
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // T1.1 — Fix the v1 redraw bug. MapLibre doesn't auto-detect container
  // resizes, so when the user switches between Scripture/Teaching tabs
  // (which changes the left pane width and therefore the map width) the
  // canvas keeps its old size and the tiles disappear. A ResizeObserver
  // tied to the container fires map.resize() whenever the container's
  // box changes, which also covers browser resizes and mobile rotation.
  useEffect(() => {
    if (!containerRef.current || !mapLoaded) return;
    const map = mapRef.current;
    if (!map) return;
    const obs = new ResizeObserver(() => {
      try { map.resize(); } catch { /* map may be mid-tear-down */ }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [mapLoaded]);

  // Add/update location markers when locations change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const locFeatures = locations.map(loc => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [loc.lon, loc.lat] },
      properties: {
        id: loc.id,
        ancient_name: loc.ancient_name,
        modern_name: loc.modern_name,
        modern_country: loc.modern_country,
        confidence_score: loc.confidence_score,
        chapters: loc.chapters_in_acts.join(', '),
      },
    }));

    const fc = { type: 'FeatureCollection' as const, features: locFeatures };

    if (map.getSource('locations')) {
      (map.getSource('locations') as maplibregl.GeoJSONSource).setData(fc);
    } else {
      map.addSource('locations', { type: 'geojson', data: fc });
      map.addLayer({
        id: 'locations-circles',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            3, 3,
            6, 5,
            10, 8,
          ],
          'circle-color': '#1B2A4A',
          'circle-opacity': [
            'interpolate', ['linear'], ['get', 'confidence_score'],
            0, 0.4,
            500, 0.7,
            1000, 1.0,
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#FDF8F0',
        },
      });
      map.addLayer({
        id: 'locations-labels',
        type: 'symbol',
        source: 'locations',
        layout: {
          'text-field': ['get', 'ancient_name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 10, 8, 13],
          'text-offset': [0, 1.1],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#1B2A4A',
          'text-halo-color': '#FDF8F0',
          'text-halo-width': 1.2,
        },
      });

      // Popup on click. Reads i18n strings from refs so the popup is
      // always in the currently-selected language.
      map.on('click', 'locations-circles', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const p = feat.properties as Record<string, string>;
        const tt = tRef.current;
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
          .setLngLat((feat.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(`
            <div class="font-heading text-base text-navy font-semibold">${escapeHtml(p.ancient_name)}</div>
            <div class="text-xs text-navy/70 mb-1">${escapeHtml(tt.map.popupToday)}: <strong>${escapeHtml(p.modern_name || '?')}</strong> · ${escapeHtml(p.modern_country || '')}</div>
            <div class="text-xs text-navy/60">${escapeHtml(tt.map.popupAppearsIn)} ${escapeHtml(p.chapters)}</div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'locations-circles', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'locations-circles', () => map.getCanvas().style.cursor = '');
    }
  }, [locations, mapLoaded]);

  // Add journey routes (drawn once)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (!map.getSource('journeys')) {
      map.addSource('journeys', { type: 'geojson', data: journeys as GeoJSON.FeatureCollection });

      // Route lines (only the LineString features)
      map.addLayer({
        id: 'journey-routes',
        type: 'line',
        source: 'journeys',
        filter: ['==', ['get', 'kind'], 'route'],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': [
            'case',
            ['==', ['get', 'journey_id'], activeJourney ?? '__none__'], 4,
            2.5,
          ],
          'line-opacity': [
            'case',
            ['==', ['get', 'journey_id'], activeJourney ?? '__none__'], 1,
            activeJourney ? 0.2 : 0.7,
          ],
          'line-dasharray': [3, 1.5],
        },
      });

      // Stop markers — larger for the active journey so direction reads
      // clearly. The active journey's stops also carry a numbered badge
      // (see `journey-stop-numbers` below) and Origin/Destination labels
      // for the first and last stop (`journey-stop-endpoints`).
      map.addLayer({
        id: 'journey-stops',
        type: 'circle',
        source: 'journeys',
        filter: ['==', ['get', 'kind'], 'stop'],
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'journey_id'], activeJourney ?? '__none__'], 9,
            3,
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#FDF8F0',
          'circle-stroke-width': 1.5,
          'circle-opacity': [
            'case',
            ['==', ['get', 'journey_id'], activeJourney ?? '__none__'], 1,
            activeJourney ? 0.3 : 0.85,
          ],
        },
      });

      // T1.2 — Numbered pins for the active journey only. The text
      // sits on top of the enlarged active-journey circle and shows the
      // stop's sequence (1, 2, 3, …) so the chronological direction of
      // the journey reads at a glance.
      map.addLayer({
        id: 'journey-stop-numbers',
        type: 'symbol',
        source: 'journeys',
        filter: ['all',
          ['==', ['get', 'kind'], 'stop'],
          ['==', ['get', 'journey_id'], activeJourney ?? '__none__'],
        ],
        layout: {
          'text-field': ['to-string', ['get', 'sequence']],
          'text-font': ['Noto Sans Bold'],
          'text-size': 10,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#FDF8F0',
          'text-halo-color': '#1B2A4A',
          'text-halo-width': 1.5,
        },
      });

      // T1.3 — Origin / Destination badges. Renders a small label above
      // the first stop (sequence === 1) and the last stop
      // (sequence === total_stops) of the active journey. Text values
      // are read from the i18n dictionary at layer-creation time and
      // refreshed on language change in a separate effect below.
      map.addLayer({
        id: 'journey-stop-endpoints',
        type: 'symbol',
        source: 'journeys',
        filter: ['all',
          ['==', ['get', 'kind'], 'stop'],
          ['==', ['get', 'journey_id'], activeJourney ?? '__none__'],
          ['any',
            ['==', ['get', 'sequence'], 1],
            ['==', ['get', 'sequence'], ['get', 'total_stops']],
          ],
        ],
        layout: {
          'text-field': [
            'case',
            ['==', ['get', 'sequence'], 1], t.map.origin,
            t.map.destination,
          ],
          'text-font': ['Noto Sans Bold'],
          'text-size': 11,
          'text-offset': [0, -1.9],
          'text-anchor': 'bottom',
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#1B2A4A',
          'text-halo-color': '#FDF8F0',
          'text-halo-width': 2.5,
        },
      });

      map.on('click', 'journey-stops', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const p = feat.properties as Record<string, string>;
        const tt = tRef.current;
        const ff = fmtRef.current;
        // Look up the translated journey name (falls back to the data value).
        const localizedJourney = (tt.journeys as Record<string, string>)[p.journey_id] ?? p.journey_name;
        // Stop name, acts_ref, and notes come from journeys.geojson. They
        // are authored in English; when a Kinyarwanda BSB/journey dataset
        // exists, regenerate journeys.geojson and these will follow.
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ offset: 12 })
          .setLngLat((feat.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(`
            <div class="text-xs uppercase tracking-wider font-bold" style="color:${p.color}">
              ${escapeHtml(ff(tt.map.popupStopOf, { n: p.sequence, total: p.total_stops }))}
            </div>
            <div class="font-heading text-base text-navy font-semibold">${escapeHtml(p.name)}</div>
            <div class="text-xs text-navy/70 italic">${escapeHtml(localizedJourney)}</div>
            <div class="text-xs text-navy mt-1">${escapeHtml(p.acts_ref)}</div>
            <div class="text-xs text-navy/80 mt-1 max-w-[260px]">${escapeHtml(p.notes)}</div>
          `)
          .addTo(map);
      });

      map.on('click', 'journey-routes', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const p = feat.properties as Record<string, string>;
        onJourneySelect(p.journey_id === activeJourney ? null : p.journey_id);
      });

      map.on('mouseenter', 'journey-stops', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'journey-stops', () => map.getCanvas().style.cursor = '');
    }
  }, [journeys, mapLoaded]);

  // Re-paint route emphasis + re-filter the numbered-pin and
  // origin/destination layers when the active journey changes. Also
  // animates the route line drawing for the newly-active journey.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer('journey-routes')) return;

    const activeFilter = activeJourney ?? '__none__';

    // Static route emphasis (dashes stay; thickness/opacity change)
    map.setPaintProperty('journey-routes', 'line-width', [
      'case',
      ['==', ['get', 'journey_id'], activeFilter], 4,
      2.5,
    ]);
    map.setPaintProperty('journey-routes', 'line-opacity', [
      'case',
      ['==', ['get', 'journey_id'], activeFilter],
        // Hide the static route line while the animated overlay is drawing.
        activeJourney ? 0 : 1,
      activeJourney ? 0.2 : 0.7,
    ]);
    map.setPaintProperty('journey-stops', 'circle-radius', [
      'case',
      ['==', ['get', 'journey_id'], activeFilter], 9,
      3,
    ]);
    map.setPaintProperty('journey-stops', 'circle-opacity', [
      'case',
      ['==', ['get', 'journey_id'], activeFilter], 1,
      activeJourney ? 0.3 : 0.85,
    ]);

    // Update which stops carry the numbered badge.
    if (map.getLayer('journey-stop-numbers')) {
      map.setFilter('journey-stop-numbers', ['all',
        ['==', ['get', 'kind'], 'stop'],
        ['==', ['get', 'journey_id'], activeFilter],
      ]);
    }

    // Update which stops show Origin / Destination labels.
    if (map.getLayer('journey-stop-endpoints')) {
      map.setFilter('journey-stop-endpoints', ['all',
        ['==', ['get', 'kind'], 'stop'],
        ['==', ['get', 'journey_id'], activeFilter],
        ['any',
          ['==', ['get', 'sequence'], 1],
          ['==', ['get', 'sequence'], ['get', 'total_stops']],
        ],
      ]);
    }

    // Fly to fit the active journey
    if (activeJourney) {
      const route = (journeys.features as RouteFeature[]).find(
        f => f.properties.kind === 'route' && f.properties.journey_id === activeJourney,
      );
      if (route) {
        const bbox = turf.bbox(route);
        map.fitBounds(bbox as [number, number, number, number], {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          duration: 1400,
        });
      }
    }
  }, [activeJourney, journeys, mapLoaded]);

  // T1.3 — Refresh Origin / Destination label text when the user
  // switches language (the symbol layer text-field is set once at layer
  // creation; this effect keeps it in sync with the active language).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer('journey-stop-endpoints')) return;
    map.setLayoutProperty('journey-stop-endpoints', 'text-field', [
      'case',
      ['==', ['get', 'sequence'], 1], t.map.origin,
      t.map.destination,
    ]);
  }, [t.map.origin, t.map.destination, mapLoaded]);

  // T1.4 — Animated route drawing. When the user activates a journey,
  // the dashed line is hidden (via the opacity rule above) and the
  // route is "drawn" using a transient `active-route` source whose
  // LineString grows from 0 → full length over ~1500 ms. Once the
  // animation completes, the static dashed line fades back in.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Ensure the source + layer exist (idempotent — created once).
    if (!map.getSource('active-route')) {
      map.addSource('active-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'active-route-line',
        type: 'line',
        source: 'active-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 5,
          'line-opacity': 1,
        },
      // place above journey-routes but below the stop markers
      }, 'journey-stops');
    }

    const source = map.getSource('active-route') as maplibregl.GeoJSONSource;
    if (!source) return;

    // No active journey → clear the animated overlay and let the
    // static dashed routes show through normally.
    if (!activeJourney) {
      source.setData({ type: 'FeatureCollection', features: [] });
      // Restore the static dashed line for all journeys.
      map.setPaintProperty('journey-routes', 'line-opacity', [
        'case',
        ['==', ['get', 'journey_id'], '__none__'], 1,
        0.7,
      ]);
      return;
    }

    const route = (journeys.features as RouteFeature[]).find(
      f => f.properties.kind === 'route' && f.properties.journey_id === activeJourney,
    );
    if (!route) return;

    const fullLine = turf.lineString(route.geometry.coordinates);
    const totalLengthKm = turf.length(fullLine, { units: 'kilometers' });
    if (totalLengthKm === 0) return;

    const color = route.properties.color;
    const journeyId = activeJourney;

    let raf: number | null = null;
    let cancelled = false;
    const durationMs = 1500;
    const start = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      // Ease-out cubic so the line slows as it approaches the destination.
      const linear = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - linear, 3);
      const sliceKm = totalLengthKm * eased;
      const partial = sliceKm <= 0
        ? turf.lineString([
            route.geometry.coordinates[0],
            route.geometry.coordinates[0],
          ])
        : turf.lineSliceAlong(fullLine, 0, sliceKm, { units: 'kilometers' });

      source.setData({
        type: 'FeatureCollection',
        features: [{
          ...partial,
          properties: { color, journey_id: journeyId },
        }],
      });

      if (linear < 1) {
        raf = requestAnimationFrame(tick);
      }
      // When animation completes the source already holds the full
      // route — no further paint changes needed. The dashed static
      // route remains hidden for the active journey (set in the
      // activeJourney effect) so we don't end up with a doubled line.
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [activeJourney, journeys, mapLoaded]);

  // Fit to the panel's bounding box on panel change (if no journey is active)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || activeJourney) return;
    if (locations.length === 0) return;

    const points = turf.featureCollection(
      locations.map(l => turf.point([l.lon, l.lat])),
    );
    const bbox = turf.bbox(points);
    map.fitBounds(bbox as [number, number, number, number], {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      duration: 1200,
      maxZoom: 6.5,
    });
  }, [activePanel, locations, mapLoaded, activeJourney]);

  const routeFeatures = (journeys.features as RouteFeature[]).filter(
    f => f.properties.kind === 'route',
  );

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Journey selector overlay */}
      <div className="absolute top-3 left-3 z-10 bg-cream-warm/95 backdrop-blur rounded-lg shadow-md border border-cream-dark p-2 max-w-[240px]">
        <div className="text-[10px] uppercase tracking-widest text-navy/60 font-bold mb-1.5 px-1">
          {t.map.legendHeader}
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onJourneySelect(null)}
            className={`text-left text-xs px-2 py-1 rounded transition-colors ${activeJourney === null ? 'bg-navy text-cream' : 'text-navy/80 hover:bg-cream-dark'}`}
          >
            {t.map.allLocations}
          </button>
          {routeFeatures.map(r => (
            <button
              key={r.properties.journey_id}
              onClick={() => onJourneySelect(r.properties.journey_id)}
              className={`text-left text-xs px-2 py-1 rounded transition-colors flex items-center gap-2 ${activeJourney === r.properties.journey_id ? 'bg-navy text-cream' : 'text-navy/80 hover:bg-cream-dark'}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: r.properties.color }} />
              <span className="truncate">{journeyName(r.properties.journey_id, r.properties.name)}</span>
              <span className="text-[10px] opacity-60 ml-auto">{r.properties.period}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string | number) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
