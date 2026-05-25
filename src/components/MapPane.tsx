import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Popup } from 'maplibre-gl';
import * as turf from '@turf/turf';
import type { ActsLocation, JourneysCollection, Panel, RouteFeature } from '../types';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

      // Popup on click
      map.on('click', 'locations-circles', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const p = feat.properties as Record<string, string>;
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ offset: 12, closeButton: true })
          .setLngLat((feat.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(`
            <div class="font-heading text-base text-navy font-semibold">${escapeHtml(p.ancient_name)}</div>
            <div class="text-xs text-navy/70 mb-1">Today: <strong>${escapeHtml(p.modern_name || '?')}</strong> · ${escapeHtml(p.modern_country || '')}</div>
            <div class="text-xs text-navy/60">Appears in Acts ${escapeHtml(p.chapters)}</div>
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

      // Stop markers
      map.addLayer({
        id: 'journey-stops',
        type: 'circle',
        source: 'journeys',
        filter: ['==', ['get', 'kind'], 'stop'],
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'journey_id'], activeJourney ?? '__none__'], 6,
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

      map.on('click', 'journey-stops', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const p = feat.properties as Record<string, string>;
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ offset: 12 })
          .setLngLat((feat.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(`
            <div class="text-xs uppercase tracking-wider font-bold" style="color:${p.color}">
              Stop ${escapeHtml(p.sequence)} of ${escapeHtml(p.total_stops)}
            </div>
            <div class="font-heading text-base text-navy font-semibold">${escapeHtml(p.name)}</div>
            <div class="text-xs text-navy/70 italic">${escapeHtml(p.journey_name)}</div>
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

  // Re-paint route emphasis when active journey changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer('journey-routes')) return;
    map.setPaintProperty('journey-routes', 'line-width', [
      'case',
      ['==', ['get', 'journey_id'], activeJourney ?? '__none__'], 4,
      2.5,
    ]);
    map.setPaintProperty('journey-routes', 'line-opacity', [
      'case',
      ['==', ['get', 'journey_id'], activeJourney ?? '__none__'], 1,
      activeJourney ? 0.2 : 0.7,
    ]);
    map.setPaintProperty('journey-stops', 'circle-radius', [
      'case',
      ['==', ['get', 'journey_id'], activeJourney ?? '__none__'], 6,
      3,
    ]);
    map.setPaintProperty('journey-stops', 'circle-opacity', [
      'case',
      ['==', ['get', 'journey_id'], activeJourney ?? '__none__'], 1,
      activeJourney ? 0.3 : 0.85,
    ]);

    // Fly to fit the active journey
    if (activeJourney) {
      const route = (journeys.features as RouteFeature[]).find(
        f => f.properties.kind === 'route' && f.properties.journey_id === activeJourney,
      );
      if (route) {
        const bbox = turf.bbox(route);
        map.fitBounds(bbox as [number, number, number, number], {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          duration: 1400,
        });
      }
    }
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
          Paul's Journeys
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onJourneySelect(null)}
            className={`text-left text-xs px-2 py-1 rounded transition-colors ${activeJourney === null ? 'bg-navy text-cream' : 'text-navy/80 hover:bg-cream-dark'}`}
          >
            All locations
          </button>
          {routeFeatures.map(r => (
            <button
              key={r.properties.journey_id}
              onClick={() => onJourneySelect(r.properties.journey_id)}
              className={`text-left text-xs px-2 py-1 rounded transition-colors flex items-center gap-2 ${activeJourney === r.properties.journey_id ? 'bg-navy text-cream' : 'text-navy/80 hover:bg-cream-dark'}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: r.properties.color }} />
              <span className="truncate">{r.properties.name}</span>
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
