import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Popup } from 'maplibre-gl';
import { DUO_STAGES, DUO_COLORS, type DuoStage } from '../data/twolives';
import { curveSegment } from './MapPane';
import { useT } from '../i18n/LanguageContext';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenVerse?: (chapter: number, verse: number) => void;
}

/**
 * Two Lives, One Calling — Saul/Paul & Barnabas SIDE BY SIDE.
 * One map shows both men at every scene of the story; a double-lane
 * timeline shows when their roads ran together (gold ties) and when
 * apart; twin story cards tell each man's side of the same moment.
 */
export function TwoLivesView({ open, onClose, onOpenVerse }: Props) {
  const { t, fmt, lang } = useT();
  const [stageIdx, setStageIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const stage = DUO_STAGES[Math.min(stageIdx, DUO_STAGES.length - 1)];
  const isRw = lang === 'rw';
  const paulName = isRw ? 'Pawulo' : 'Paul';
  const barnName = isRw ? 'Barinaba' : 'Barnabas';

  const stageRef = useRef(stage);
  const tRef = useRef(t);
  const langRef = useRef(lang);
  useEffect(() => {
    stageRef.current = stage;
    tRef.current = t;
    langRef.current = lang;
  }, [stage, t, lang]);

  // Reset when reopened.
  useEffect(() => { if (open) { setStageIdx(0); setPlaying(false); } }, [open]);

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Play: advance a scene every ~7s, stop at the end.
  useEffect(() => {
    if (!open || !playing) return;
    const id = setInterval(() => {
      setStageIdx(i => {
        if (i >= DUO_STAGES.length - 1) { setPlaying(false); return i; }
        return i + 1;
      });
    }, 7000);
    return () => clearInterval(id);
  }, [open, playing]);

  /** Marker popup — one man's side of the current scene. */
  const openSidePopup = (who: 'paul' | 'barnabas') => {
    const map = mapRef.current;
    if (!map) return;
    const s = stageRef.current;
    const tt = tRef.current;
    const rw = langRef.current === 'rw';
    const side = s[who];
    const name = who === 'paul' ? (rw ? 'Pawulo' : 'Paul') : (rw ? 'Barinaba' : 'Barnabas');
    const color = DUO_COLORS[who];
    popupRef.current?.remove();
    popupRef.current = new maplibregl.Popup({ offset: 16, maxWidth: '300px' })
      .setLngLat([side.lon + (s.together ? (who === 'paul' ? -0.12 : 0.12) : 0), side.lat])
      .setHTML(`
        <div class="text-xs uppercase tracking-wider font-bold" style="color:${color}">${escapeHtml(name)} · ${escapeHtml(s.yearLabel)}</div>
        <div class="font-heading text-base text-navy font-semibold">${escapeHtml(rw ? side.place_rw : side.place)}</div>
        <div class="text-xs text-navy/60">${escapeHtml(tt.map.popupToday)}: <strong>${escapeHtml(side.modern)}</strong></div>
        <div class="text-xs text-navy/80 mt-1.5 max-w-[260px] leading-relaxed">${escapeHtml(rw ? side.text_rw : side.text)}</div>
      `)
      .addTo(map);
  };
  const openSidePopupRef = useRef(openSidePopup);
  useEffect(() => { openSidePopupRef.current = openSidePopup; });

  // Map lifecycle.
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
      map.addSource('duo', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      // Ghost paths — each man's whole road, always faintly visible.
      map.addLayer({
        id: 'duo-ghosts', type: 'line', source: 'duo',
        filter: ['==', ['get', 'f'], 'ghost'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-opacity': 0.18, 'line-dasharray': [2, 1.6] },
      });
      // The distance between them (only when apart) — a gold thread.
      map.addLayer({
        id: 'duo-link', type: 'line', source: 'duo',
        filter: ['==', ['get', 'f'], 'link'],
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': '#C9A84C', 'line-width': 2, 'line-opacity': 0.7, 'line-dasharray': [1.5, 1.8] },
      });
      // Gold halo when their roads meet.
      map.addLayer({
        id: 'duo-halo', type: 'circle', source: 'duo',
        filter: ['==', ['get', 'f'], 'halo'],
        paint: {
          'circle-radius': 26, 'circle-color': '#C9A84C', 'circle-opacity': 0.15,
          'circle-stroke-color': '#C9A84C', 'circle-stroke-width': 2, 'circle-stroke-opacity': 0.8,
        },
      });
      map.addLayer({
        id: 'duo-markers', type: 'circle', source: 'duo',
        filter: ['==', ['get', 'f'], 'who'],
        paint: {
          'circle-radius': 13, 'circle-color': ['get', 'color'],
          'circle-stroke-color': '#FDF8F0', 'circle-stroke-width': 2.5,
        },
      });
      map.addLayer({
        id: 'duo-letters', type: 'symbol', source: 'duo',
        filter: ['==', ['get', 'f'], 'who'],
        layout: {
          'text-field': ['get', 'letter'], 'text-font': ['Noto Sans Bold'], 'text-size': 13,
          'text-allow-overlap': true, 'text-ignore-placement': true,
        },
        paint: { 'text-color': '#FDF8F0' },
      });
      map.addLayer({
        id: 'duo-labels', type: 'symbol', source: 'duo',
        filter: ['==', ['get', 'f'], 'who'],
        layout: {
          'text-field': ['get', 'label'], 'text-font': ['Noto Sans Bold'], 'text-size': 11,
          'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-allow-overlap': true,
        },
        paint: { 'text-color': '#1B2A4A', 'text-halo-color': '#FDF8F0', 'text-halo-width': 2 },
      });

      map.on('click', 'duo-markers', e => {
        const feat = e.features?.[0];
        if (!feat) return;
        const who = (feat.properties as { who: string }).who as 'paul' | 'barnabas';
        openSidePopupRef.current(who);
      });
      map.on('mouseenter', 'duo-markers', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'duo-markers', () => map.getCanvas().style.cursor = '');

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

  // Render the current scene.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const source = map.getSource('duo') as maplibregl.GeoJSONSource;
    if (!source) return;
    const rw = lang === 'rw';

    // Ghost roads through every scene position.
    const ghost = (who: 'paul' | 'barnabas', bow: number) => {
      const pts = DUO_STAGES.map(s => [s[who].lon, s[who].lat] as [number, number]);
      const coords: [number, number][] = [];
      for (let i = 0; i < pts.length - 1; i++) coords.push(...curveSegment(pts[i], pts[i + 1], bow));
      coords.push(pts[pts.length - 1]);
      return {
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: coords },
        properties: { f: 'ghost', color: DUO_COLORS[who] },
      };
    };

    const pOff = stage.together ? -0.12 : 0;
    const bOff = stage.together ? 0.12 : 0;
    const features: GeoJSON.Feature[] = [
      ghost('paul', 0.06),
      ghost('barnabas', -0.06),
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [stage.paul.lon + pOff, stage.paul.lat] },
        properties: { f: 'who', who: 'paul', letter: 'P', color: DUO_COLORS.paul, label: `${rw ? 'Pawulo' : 'Paul'} · ${rw ? stage.paul.place_rw : stage.paul.place}` },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [stage.barnabas.lon + bOff, stage.barnabas.lat] },
        properties: { f: 'who', who: 'barnabas', letter: 'B', color: DUO_COLORS.barnabas, label: `${rw ? 'Barinaba' : 'Barnabas'} · ${rw ? stage.barnabas.place_rw : stage.barnabas.place}` },
      },
    ];
    if (stage.together) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [stage.paul.lon, stage.paul.lat] },
        properties: { f: 'halo' },
      });
    } else {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            ...curveSegment([stage.paul.lon, stage.paul.lat], [stage.barnabas.lon, stage.barnabas.lat], 0.22),
            [stage.barnabas.lon, stage.barnabas.lat],
          ],
        },
        properties: { f: 'link' },
      });
    }
    source.setData({ type: 'FeatureCollection', features });
    popupRef.current?.remove();

    const minLon = Math.min(stage.paul.lon, stage.barnabas.lon) - 1.2;
    const maxLon = Math.max(stage.paul.lon, stage.barnabas.lon) + 1.2;
    const minLat = Math.min(stage.paul.lat, stage.barnabas.lat) - 1.0;
    const maxLat = Math.max(stage.paul.lat, stage.barnabas.lat) + 1.0;
    map.fitBounds([minLon, minLat, maxLon, maxLat], {
      padding: { top: 60, bottom: 40, left: 60, right: 60 },
      duration: 1100,
      maxZoom: 7,
    });
  }, [stage, mapReady, lang]);

  // Double-lane timeline scale.
  const minYear = DUO_STAGES[0].year;
  const maxYear = DUO_STAGES[DUO_STAGES.length - 1].year;
  const span = Math.max(1, maxYear - minYear);
  const pct = (y: number) => `${4 + ((y - minYear) / span) * 92}%`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-cream flex flex-col" role="dialog" aria-modal="true" aria-label={t.twoLives.title}>
      {/* Header */}
      <header className="border-b border-cream-dark bg-cream-warm/90 px-4 md:px-6 py-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl md:text-2xl text-navy leading-tight">
            <span aria-hidden="true">⇄</span> {t.twoLives.title}
          </h2>
          <p className="text-xs text-navy/60">{t.twoLives.subtitle}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-xs font-bold uppercase tracking-wider text-navy/70 hover:text-navy border border-cream-dark hover:border-gold rounded-full px-3 py-1.5 transition-colors"
        >
          ✕ {t.twoLives.close}
        </button>
      </header>

      {/* Double-lane timeline: gold ties where their roads run together */}
      <div className="border-b border-cream-dark bg-cream-warm/50 px-4 md:px-8 pt-2 pb-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-widest text-navy/50 font-bold">{t.twoLives.lanesLabel}</span>
          <span className="text-[10px] text-navy/40">{t.twoLives.hint}</span>
        </div>
        <div className="overflow-x-auto">
          <div className="relative h-[72px] mt-1 min-w-[560px]">
            {/* lanes */}
            <div className="absolute left-[2%] right-[2%] top-[18px] h-[2px] rounded" style={{ background: DUO_COLORS.paul, opacity: 0.3 }} />
            <div className="absolute left-[2%] right-[2%] top-[44px] h-[2px] rounded" style={{ background: DUO_COLORS.barnabas, opacity: 0.3 }} />
            <span className="absolute left-[2%] top-[2px] text-[9px] font-bold" style={{ color: DUO_COLORS.paul }}>{paulName}</span>
            <span className="absolute left-[2%] bottom-0 text-[9px] font-bold" style={{ color: DUO_COLORS.barnabas }}>{barnName}</span>
            {DUO_STAGES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setPlaying(false); setStageIdx(i); }}
                className="absolute -translate-x-1/2 top-0 h-full w-7 group"
                style={{ left: pct(s.year) }}
                aria-label={`${i + 1}. ${isRw ? s.title_rw : s.title} (${s.yearLabel})`}
              >
                {/* tie between the lanes */}
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-[20px] w-0 h-[26px] border-l-2"
                  style={{
                    borderColor: s.together ? '#C9A84C' : '#1B2A4A',
                    opacity: s.together ? 0.9 : 0.15,
                    borderStyle: s.together ? 'solid' : 'dashed',
                  }}
                />
                <span
                  className={`absolute left-1/2 -translate-x-1/2 top-[13px] w-[12px] h-[12px] rounded-full border-2 transition-transform ${i === stageIdx ? 'border-gold scale-125' : 'border-cream group-hover:scale-110'}`}
                  style={{ background: DUO_COLORS.paul }}
                />
                <span
                  className={`absolute left-1/2 -translate-x-1/2 top-[39px] w-[12px] h-[12px] rounded-full border-2 transition-transform ${i === stageIdx ? 'border-gold scale-125' : 'border-cream group-hover:scale-110'}`}
                  style={{ background: DUO_COLORS.barnabas }}
                />
                <span className={`absolute left-1/2 -translate-x-1/2 bottom-0 text-[8px] leading-none whitespace-nowrap ${i === stageIdx ? 'text-navy font-bold' : 'text-navy/45'}`}>
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-[30vh]">
        <div ref={containerRef} className="absolute inset-0" />
      </div>

      {/* Scene panel */}
      <div className="border-t border-cream-dark bg-cream-warm/60 max-h-[44vh] lg:max-h-[38vh] overflow-y-auto">
        <div className="px-4 md:px-8 py-2.5 flex items-center gap-3 flex-wrap border-b border-cream-dark/60">
          <button
            onClick={() => { setPlaying(false); setStageIdx(i => Math.max(0, i - 1)); }}
            disabled={stageIdx === 0}
            className="text-xs font-bold px-3 py-1.5 rounded-full border border-cream-dark hover:border-gold text-navy/75 disabled:opacity-30 transition-colors"
          >
            ← {t.twoLives.prev}
          </button>
          <div className="flex-1 min-w-[180px] text-center">
            <div className="text-[10px] uppercase tracking-widest text-navy/50 font-bold">
              {fmt(t.twoLives.stageOf, { n: stageIdx + 1, total: DUO_STAGES.length })} · {stage.yearLabel} ·{' '}
              <span className={stage.together ? 'text-gold-dark' : 'text-navy/50'}>
                {stage.together ? `⇄ ${t.twoLives.together}` : t.twoLives.apart}
              </span>
            </div>
            <div className="font-heading text-lg text-navy leading-tight">{isRw ? stage.title_rw : stage.title}</div>
            <div className="text-[11px] text-navy/60">
              {stage.ref.replace(/^Acts\b/, t.scripture.chapterPrefix)}
              {stage.chapter > 0 && (
                <button
                  onClick={() => { onClose(); onOpenVerse?.(stage.chapter, stage.verse); }}
                  className="ml-2 text-gold-dark hover:text-navy font-bold"
                >
                  {t.map.jumpToVerse}
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => { setPlaying(false); setStageIdx(i => Math.min(DUO_STAGES.length - 1, i + 1)); }}
            disabled={stageIdx === DUO_STAGES.length - 1}
            className="text-xs font-bold px-3 py-1.5 rounded-full border border-cream-dark hover:border-gold text-navy/75 disabled:opacity-30 transition-colors"
          >
            {t.twoLives.next} →
          </button>
          <button
            onClick={() => setPlaying(p => !p)}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
            style={{ backgroundColor: playing ? '#7B2D26' : '#C9A84C', color: playing ? '#FDF8F0' : '#1B2A4A' }}
          >
            {playing ? `⏹ ${t.twoLives.stop}` : `▶ ${t.twoLives.play}`}
          </button>
        </div>

        {/* Side-by-side cards */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 px-3 md:px-8 py-3">
          <div className="rounded-lg bg-cream border-l-4 p-2.5 md:p-3" style={{ borderColor: DUO_COLORS.paul }}>
            <div className="text-[10px] md:text-xs uppercase tracking-wider font-bold" style={{ color: DUO_COLORS.paul }}>
              {isRw ? 'Sawuli / Pawulo' : 'Saul / Paul'}
            </div>
            <div className="text-[12px] md:text-[13px] font-semibold text-navy">{isRw ? stage.paul.place_rw : stage.paul.place}</div>
            <div className="text-[10px] md:text-[11px] text-navy/50">{t.map.popupToday}: {stage.paul.modern}</div>
            <p className="text-[11px] md:text-[12.5px] text-navy/85 leading-snug mt-1">{isRw ? stage.paul.text_rw : stage.paul.text}</p>
          </div>
          <div className="rounded-lg bg-cream border-l-4 p-2.5 md:p-3" style={{ borderColor: DUO_COLORS.barnabas }}>
            <div className="text-[10px] md:text-xs uppercase tracking-wider font-bold" style={{ color: DUO_COLORS.barnabas }}>
              {barnName}
            </div>
            <div className="text-[12px] md:text-[13px] font-semibold text-navy">{isRw ? stage.barnabas.place_rw : stage.barnabas.place}</div>
            <div className="text-[10px] md:text-[11px] text-navy/50">{t.map.popupToday}: {stage.barnabas.modern}</div>
            <p className="text-[11px] md:text-[12.5px] text-navy/85 leading-snug mt-1">{isRw ? stage.barnabas.text_rw : stage.barnabas.text}</p>
          </div>
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
