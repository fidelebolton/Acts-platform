import { useMemo } from 'react';
import type { ScripturePayload, Panel } from '../types';
import { useT } from '../i18n/LanguageContext';

interface Props {
  scripture: ScripturePayload;
  activePanel: Panel['id'];
  onPanelSelect: (id: Panel['id']) => void;
  onJourneySelect: (id: string | null) => void;
}

// Major chronological milestones in Acts. Dates are approximate scholarly
// consensus dates — most Acts chronologies place the events between
// AD 30 (Pentecost) and AD 62 (Paul's two-year house arrest in Rome).
//
// The `id` field keys into `t.timeline.events.<id>` for the human-readable
// title and blurb — translations live in src/i18n/en.json and src/i18n/rw.json,
// not in this file. To add a new language, add the keyed entries in that
// language's JSON file; no code change here is needed.
type TimelineEventKey =
  | 'pentecost' | 'stephen-martyred' | 'saul-converted' | 'cornelius'
  | 'herod-dies' | 'first-journey' | 'jerusalem-council' | 'second-journey'
  | 'macedonian-vision' | 'areopagus-sermon' | 'third-journey'
  | 'silversmiths-riot' | 'paul-arrested' | 'voyage-to-rome' | 'house-arrest';

interface TimelineMeta {
  id: TimelineEventKey;
  year: string;
  panel: Panel['id'];
  chapter: number;
  journey?: string;
}

const TIMELINE_EVENTS: TimelineMeta[] = [
  { id: 'pentecost',          year: 'AD 30', panel: 1, chapter: 2 },
  { id: 'stephen-martyred',   year: 'AD 31', panel: 1, chapter: 7 },
  { id: 'saul-converted',     year: 'AD 33', panel: 2, chapter: 9 },
  { id: 'cornelius',          year: 'AD 36', panel: 3, chapter: 10 },
  { id: 'herod-dies',         year: 'AD 44', panel: 3, chapter: 12 },
  { id: 'first-journey',      year: 'AD 46', panel: 4, chapter: 13, journey: 'journey-1' },
  { id: 'jerusalem-council',  year: 'AD 49', panel: 4, chapter: 15 },
  { id: 'second-journey',     year: 'AD 49', panel: 5, chapter: 15, journey: 'journey-2' },
  { id: 'macedonian-vision',  year: 'AD 50', panel: 5, chapter: 16 },
  { id: 'areopagus-sermon',   year: 'AD 51', panel: 5, chapter: 17 },
  { id: 'third-journey',      year: 'AD 53', panel: 5, chapter: 18, journey: 'journey-3' },
  { id: 'silversmiths-riot',  year: 'AD 56', panel: 5, chapter: 19 },
  { id: 'paul-arrested',      year: 'AD 57', panel: 6, chapter: 21 },
  { id: 'voyage-to-rome',     year: 'AD 59', panel: 6, chapter: 27, journey: 'journey-4' },
  { id: 'house-arrest',       year: 'AD 60', panel: 6, chapter: 28 },
];

export function TimelineBar({ activePanel, onPanelSelect, onJourneySelect }: Props) {
  const { t } = useT();
  const events = TIMELINE_EVENTS;

  // Compute position of each event along the bar (0–100%)
  const minY = 30;
  const maxY = 62;
  const positioned = useMemo(
    () =>
      events.map(e => {
        const year = parseInt(e.year.replace('AD ', ''), 10);
        const pct = ((year - minY) / (maxY - minY)) * 100;
        return { ...e, pct, year_num: year };
      }),
    [events],
  );

  return (
    <div className="border-t border-cream-dark bg-cream-warm/80 backdrop-blur">
      <div className="px-4 md:px-8 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] uppercase tracking-widest text-navy/60 font-bold">
            {t.timeline.header}
          </div>
          <div className="text-[10px] text-navy/50 italic">
            {t.timeline.hint}
          </div>
        </div>

        <div className="relative h-14">
          {/* Track */}
          <div className="absolute left-0 right-0 top-7 h-px bg-navy/20" />
          <div className="absolute left-0 top-7 -translate-y-1/2 text-[10px] text-navy/50">
            30
          </div>
          <div className="absolute right-0 top-7 -translate-y-1/2 text-[10px] text-navy/50">
            62
          </div>

          {/* Events */}
          {positioned.map((e, i) => {
            const isActive = e.panel === activePanel;
            const meta = t.timeline.events[e.id];
            const title = meta?.title ?? e.id;
            const blurb = meta?.blurb ?? '';
            const chapterLabel = `${t.scripture.chapterPrefix} ${e.chapter}`;
            return (
              <button
                key={i}
                onClick={() => {
                  onPanelSelect(e.panel);
                  if (e.journey) onJourneySelect(e.journey);
                }}
                className="absolute top-0 -translate-x-1/2 group"
                style={{ left: `${e.pct}%` }}
                title={`${e.year} — ${title}: ${blurb}`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mx-auto mt-6 transition-all ${
                    isActive
                      ? 'bg-gold scale-125 ring-2 ring-gold/30'
                      : 'bg-navy/70 group-hover:bg-navy group-hover:scale-110'
                  }`}
                />
                <div className="text-[9px] text-navy/70 mt-1 whitespace-nowrap text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {e.year}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-12 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-navy text-cream text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  <span className="font-semibold">{title}</span> · {chapterLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
