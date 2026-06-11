import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Popup } from 'maplibre-gl';
import { ATLAS_FIGURES, type AtlasEvent, type AtlasFigureId } from '../data/atlas';
import { curveSegment } from './MapPane';
import { useT } from '../i18n/LanguageContext';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Jump to a verse in the Scripture pane (closes the atlas first). */
  onOpenVerse?: (chapter: number, verse: number) => void;
  /** Open the side-by-side Paul & Barnabas story. */
  onOpenDuo?: () => void;
}

/**
 * The Acts Atlas — a collection of maps, one per key figure.
 * Full-screen overlay: pick a person, see their whole life traced on its
 * own map (birth ★, numbered ministry stops, martyrdom †, tradition ◆)
 * with a to-scale life TIMELINE and a life-story panel. All three views
 * interact: tap a year on the timeline, a marker on the map, or an event
 * in the story — the other two follow.
 */
export function AtlasView({ open, onClose, onOpenVerse, onOpenDuo }: Props) {
  const { t, fmt, lang } = useT();
  const [figureId, setFigureId] = useState<AtlasFigureId>('peter');
  const [activeSeq, setActiveSeq] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const [mapReady, setMapReady] = useState(false);

  const figure = useMemo(
    () => ATLAS_FIGURES.find(f => f.id === figureId) ?? ATLAS_FIGURES[0],
    [figureId],
  );
  const isRw = lang === 'rw';

  // Refs so the once-registered map click handler always sees fresh data.
  const figureRef = useRef(figure);
  const tRef = useRef(t);
  const langRef = useRef(lang);
  useEffect(() => {
    figureRef.current = figure;
    tRef.current = t;
    langRef.current = lang;
  }, [figure, t, lang]);

  // New leader → fresh page of the atlas.
  useEffect(() => { setActiveSeq(null); }, [figureId]);

  // Esc closes the atlas.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /** Build + open the popup for one life event (shared by all views). */
  const openEventPopup = (e: AtlasEvent) => {
    const map = mapRef.current;
    if (!map) return;
    const tt = tRef.current;
    const rw = langRef.current === 'rw';
    const fig = figureRef.current;
    const kindLabel = tt.atlas.kind[e.kind];
    const title = rw ? e.title_rw : e.title;
    const place = rw ? e.place_rw : e.place;
    const note = rw ? e.note_rw : e.note;
    const ref = e.ref.replace(/^Acts\b/, tt.scripture.chapterPrefix);
    popupRef.current?.remove();
    popupRef.current = new maplibregl.Popup({ offset: 16, maxWidth: '320px' })
      .setLngLat([e.lon, e.lat])
      .setHTML(`
        <div class="text-xs uppercase tracking-wider font-bold" style="color:${fig.color}">${e.seq}. ${escapeHtml(kindLabel)} · ${escapeHtml(e.yearLabel)}</div>
        <div class="font-heading text-base text-navy font-semibold">${escapeHtml(title)}</div>
        <div class="text-xs text-navy/70 italic">${escapeHtml(place)} · ${escapeHtml(ref)}</div>
        <div class="text-xs text-navy/60">${escapeHtml(tt.map.popupToday)}: <strong>${escapeHtml(e.modern)}</strong></div>
        <div class="text-xs text-navy/80 mt-1.5 max-w-[280px] leading-relaxed">${escapeHtml(note)}</div>
        ${e.chapter > 0 ? `<button data-jump-verse data-chapter="${e.chapter}" data-verse="${e.verse}" class="mt-1.5 text-[11px] text-gold-dark hover:text-navy font-bold cursor-pointer">${escapeHtml(tt.map.jumpToVerse)}</button>` : ''}
      `)
      .addTo(map);
    const btn = popupRef.current.getElement()?.querySelector('[data-jump-verse]') as HTMLButtonElement | null;
    if (btn) {
      btn.addEventListener('click', () => {
        const ch = parseInt(btn.dataset.chapter || '0', 10);
        const v = parseInt(btn.dataset.verse || '0', 10);
        if (ch > 0 && v > 0) {
          onClose();
          onOpenVerse?.(ch, v);
        }
      });
    }
  };

  /** Fly to an event + open its popup + sync the timeline and the story
   *  panel. One function shared by all three views. */
  const flyToEvent = (e: AtlasEvent) => {
    const map = mapRef.current;
    if (!map) return;
    setActiveSeq(e.seq);
    itemRefs.current[e.seq]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    map.flyTo({ center: [e.lon, e.lat], zoom: Math.max(map.getZoom(), 5.5), duration: 1000, essential: true });
    openEventPopup(e);
  };
  const flyToEventRef = useRef(flyToEvent);
  useEffect(() => { flyToEventRef.current = flyToEvent; });

  // Create the map when the atlas opens; tear it down when it closes.
  useEffect(() => {
    if (!open || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [30, 36],
      zoom: 4,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');

    map.on('load', () => {
      map.addSource('life', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'life-path',
        type: 'line',
        source: 'life',
        filter: ['==', ['get', 'f'], 'path'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-opacity': 0.55,
          'line-dasharray': [2.2, 1.4],
        },
      });
      map.addLayer({
        id: 'life-stops',
        type: 'circle',
        source: 'life',
        filter: ['==', ['get', 'f'], 'stop'],
        paint: {
          'circle-radius': 11,
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#FDF8F0',
          'circle-stroke-width': 2,
        },
      });
      map.addLayer({
        id: 'life-numbers',
        type: 'symbol',
        source: 'life',
        filter: ['==', ['get', 'f'], 'stop'],
        layout: {
          'text-field': ['get', 'seq'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 11,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#FDF8F0',
          'text-halo-color': '#1B2A4A',
          'text-halo-width': 1.2,
        },
      });
      map.addLayer({
        id: 'life-glyphs',
        type: 'symbol',
        source: 'life',
        filter: ['all', ['==', ['get', 'f'], 'stop'], ['!=', ['get', 'glyph'], '']],
        layout: {
          'text-field': ['get', 'glyph'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 15,
          'text-offset': [0, -1.45],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#C9A84C',
          'text-halo-color': '#1B2A4A',
          'text-halo-width': 1.2,
        },
      });
      map.addLayer({
        id: 'life-labels',
        type: 'symbol',
        source: 'life',
        filter: ['==', ['get', 'f'], 'stop'],
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 11,
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#1B2A4A',
          'text-halo-color': '#FDF8F0',
          'text-halo-width': 2,
        },
      });

      map.on('click', 'life-stops', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const seq = Number((feat.properties as { seq: string }).seq);
        const ev = figureRef.current.events.find(x => x.seq === seq);
        if (ev) flyToEventRef.current(ev);
      });
      map.on('mouseenter', 'life-stops', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'life-stops', () => map.getCanvas().style.cursor = '');

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      mapRef.current = null;
      setMapReady(false);
      map.remove();
    };
  }, [open]);

  // Load the selected figure's life onto the map (re-runs on language
  // switch so labels stay localized).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const source = map.getSource('life') as maplibregl.GeoJSONSource;
    if (!source) return;

    const rw = lang === 'rw';
    const pathCoords: [number, number][] = [];
    for (let i = 0; i < figure.events.length - 1; i++) {
      const a: [number, number] = [figure.events[i].lon, figure.events[i].lat];
      const b: [number, number] = [figure.events[i + 1].lon, figure.events[i + 1].lat];
      pathCoords.push(...curveSegment(a, b, i % 2 === 0 ? 0.08 : -0.08));
    }
    const last = figure.events[figure.events.length - 1];
    pathCoords.push([last.lon, last.lat]);

    const features: GeoJSON.Feature[] = [
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: pathCoords },
        properties: { f: 'path', color: figure.color },
      },
      ...figure.events.map(e => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [e.lon, e.lat] },
        properties: {
          f: 'stop',
          seq: String(e.seq),
          color: figure.color,
          glyph: glyphFor(e.kind),
          label: rw ? e.place_rw : e.place,
        },
      })),
    ];
    source.setData({ type: 'FeatureCollection', features });
    popupRef.current?.remove();

    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
    for (const e of figure.events) {
      minLon = Math.min(minLon, e.lon); maxLon = Math.max(maxLon, e.lon);
      minLat = Math.min(minLat, e.lat); maxLat = Math.max(maxLat, e.lat);
    }
    map.fitBounds([minLon, minLat, maxLon, maxLat], {
      padding: { top: 70, bottom: 60, left: 70, right: 70 },
      duration: 900,
      maxZoom: 7.5,
    });
  }, [figure, mapReady, lang]);

  // ─── Life timeline (to scale) ───────────────────────────────────────
  const minYear = Math.min(...figure.events.map(e => e.year));
  const maxYear = Math.max(...figure.events.map(e => e.year));
  const yearSpan = Math.max(1, maxYear - minYear);
  const timelinePct = (y: number) => `${3 + ((y - minYear) / yearSpan) * 94}%`;
  const decadeTicks: number[] = [];
  for (let d = Math.ceil(minYear / 10) * 10; d <= maxYear; d += 10) decadeTicks.push(d);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col" role="dialog" aria-modal="true" aria-label={t.atlas.title}>
      {/* Header */}
      <header className="border-b border-cream-dark bg-cream-warm/90 px-4 md:px-6 py-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl md:text-2xl text-navy leading-tight">
            <span aria-hidden="true">🧭</span> {t.atlas.title}
          </h2>
          <p className="text-xs text-navy/60">{t.atlas.subtitle}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-xs font-bold uppercase tracking-wider text-navy/70 hover:text-navy border border-cream-dark hover:border-gold rounded-full px-3 py-1.5 transition-colors"
        >
          ✕ {t.atlas.close}
        </button>
      </header>

      {/* Figure chips — one map per person */}
      <div className="border-b border-cream-dark bg-cream-warm/60 px-3 md:px-6 py-2 flex gap-1.5 overflow-x-auto">
        {onOpenDuo && (
          <button
            onClick={onOpenDuo}
            className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gold bg-gold/15 text-navy font-semibold hover:bg-gold/30 transition-colors"
          >
            <span aria-hidden="true">⇄</span>
            {t.atlas.duoChip}
          </button>
        )}
        {ATLAS_FIGURES.map(f => (
          <button
            key={f.id}
            onClick={() => setFigureId(f.id)}
            className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              f.id === figureId
                ? 'bg-navy text-cream border-navy font-semibold'
                : 'text-navy/75 border-cream-dark hover:border-gold bg-cream'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: f.color }} />
            {isRw ? f.name_rw : f.name}
          </button>
        ))}
      </div>

      {/* Life timeline — to scale. Tap a year: the map and the story follow. */}
      <div className="border-b border-cream-dark bg-cream-warm/50 px-4 md:px-8 pt-2 pb-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-navy/50 font-bold">
            {t.atlas.timelineLabel}
          </span>
          <span className="text-[10px] text-navy/40">{t.atlas.timelineHint}</span>
        </div>
        <div className="overflow-x-auto">
          <div className="relative h-[76px] mt-1 min-w-[560px]">
            {/* axis */}
            <div className="absolute left-[2%] right-[2%] top-[30px] h-px bg-navy/20" />
            {/* decade ticks */}
            {decadeTicks.map(d => (
              <div key={d} className="absolute -translate-x-1/2 text-center" style={{ left: timelinePct(d), top: '24px' }}>
                <div className="w-px h-3 bg-navy/15 mx-auto" />
                <div className="text-[9px] text-navy/35 mt-[26px]">AD {d}</div>
              </div>
            ))}
            {/* events */}
            {figure.events.map((e, i) => (
              <button
                key={e.seq}
                onClick={() => flyToEvent(e)}
                className="absolute -translate-x-1/2 flex flex-col items-center group"
                style={{ left: timelinePct(e.year), top: 0 }}
                aria-label={`${e.seq}. ${isRw ? e.title_rw : e.title} (${e.yearLabel})`}
              >
                <span className="h-[10px] text-[12px] leading-none text-gold-dark" aria-hidden="true">
                  {glyphFor(e.kind)}
                </span>
                <span
                  className={`w-[19px] h-[19px] rounded-full text-[9px] font-bold text-cream flex items-center justify-center border-2 transition-transform ${
                    activeSeq === e.seq ? 'border-gold scale-125' : 'border-cream group-hover:scale-110'
                  }`}
                  style={{ background: figure.color }}
                >
                  {e.seq}
                </span>
                <span
                  className={`text-[9px] whitespace-nowrap leading-none ${i % 2 === 1 ? 'mt-[15px]' : 'mt-[3px]'} ${
                    activeSeq === e.seq ? 'text-navy font-bold' : 'text-navy/55'
                  }`}
                >
                  {e.yearLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map + life story */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex-1 min-h-[38vh]">
          <div ref={containerRef} className="absolute inset-0" />
        </div>

        <aside className="lg:w-[380px] lg:min-w-[340px] border-t lg:border-t-0 lg:border-l border-cream-dark bg-cream-warm/40 overflow-y-auto max-h-[38vh] lg:max-h-none">
          <div className="px-4 py-3 border-b border-cream-dark bg-cream-warm/70 sticky top-0 backdrop-blur z-10">
            <div className="text-xs uppercase tracking-widest font-bold" style={{ color: figure.color }}>
              {fmt(t.atlas.lifeOf, { name: isRw ? figure.name_rw : figure.name })}
            </div>
            <div className="text-xs text-navy/70 italic">{isRw ? figure.role_rw : figure.role}</div>
          </div>
          <p className="px-4 pt-3 pb-1 text-[13px] text-navy/80 leading-relaxed">
            {isRw ? figure.summary_rw : figure.summary}
          </p>
          <div className="px-4 pt-1 pb-1 text-[10px] uppercase tracking-widest text-navy/45 font-bold">
            {t.atlas.hint}
          </div>
          <ol className="px-3 pb-6 pt-1 flex flex-col gap-1">
            {figure.events.map(e => (
              <li key={e.seq} ref={el => { itemRefs.current[e.seq] = el; }}>
                <button
                  onClick={() => flyToEvent(e)}
                  className={`w-full text-left rounded-lg border px-2.5 py-2 transition-colors ${
                    activeSeq === e.seq
                      ? 'border-gold bg-cream'
                      : 'border-transparent hover:border-gold hover:bg-cream'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold text-cream flex items-center justify-center"
                      style={{ background: figure.color }}
                    >
                      {e.seq}
                    </span>
                    <span className="text-[13px] font-semibold text-navy leading-snug">
                      {e.kind !== 'ministry' && (
                        <span className="text-gold-dark mr-1" aria-hidden="true">{glyphFor(e.kind)}</span>
                      )}
                      {isRw ? e.title_rw : e.title}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-navy/50 font-semibold">{e.yearLabel}</span>
                  </div>
                  <div className="pl-7 text-[11px] text-navy/60">
                    {isRw ? e.place_rw : e.place} · {e.ref.replace(/^Acts\b/, t.scripture.chapterPrefix)}
                    {e.kind !== 'ministry' && <> · {t.atlas.kind[e.kind]}</>}
                  </div>
                  <div className="pl-7 text-[11px] text-navy/50">
                    {t.map.popupToday}: {e.modern}
                  </div>
                  <div className="pl-7 text-[12px] text-navy/80 leading-snug mt-0.5">
                    {isRw ? e.note_rw : e.note}
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function glyphFor(k: AtlasEvent['kind']) {
  return k === 'birth' ? '★' : k === 'martyrdom' ? '†' : k === 'tradition' ? '◆' : '';
}

function escapeHtml(s: string | number) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
