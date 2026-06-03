import { useEffect, useMemo } from 'react';
import { useT } from '../i18n/LanguageContext';
import type { Panel } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  activePanel: Panel['id'];
  onPanelSelect: (id: Panel['id']) => void;
  onJourneySelect: (id: string | null) => void;
  /** Jump to a chapter (opens the Scripture pane and scrolls to verse 1). */
  onOpenChapter: (chapter: number) => void;
}

// ─── Timeline data ────────────────────────────────────────────────────
// The chronology follows the mainstream "Acts + epistles are complementary"
// synthesis: absolute anchors (Herod's death AD 44, the Gallio inscription
// AD 51, Festus' succession c. AD 60) with Paul's relative intervals from
// Galatians overlaid. Dates are approximate scholarly consensus.
//
// `year`      → numeric position on the to-scale axis (and used to compute
//               the elapsed-time gap to the next event).
// `dateLabel` → language-neutral display string ("AD 30", "AD 58–60").
// `id`        → keys into t.timeline.events.<id> (title + blurb) and, where
//               present, t.timelineView.durations.<id> (the stay pill).
// `duration`  → true when this event represents an extended stay rather than
//               a single moment (renders the gold duration pill).

interface TLEvent {
  id: string;
  year: number;
  dateLabel: string;
  chapter: number;
  panel: Panel['id'];
  journey?: string;
  duration?: boolean;
}

const EVENTS: TLEvent[] = [
  { id: 'pentecost',            year: 30,   dateLabel: 'AD 30',     chapter: 2,  panel: 1 },
  { id: 'stephen-martyred',     year: 34,   dateLabel: 'AD 34',     chapter: 7,  panel: 2 },
  { id: 'saul-converted',       year: 35,   dateLabel: 'AD 35',     chapter: 9,  panel: 2 },
  { id: 'first-jerusalem-visit',year: 38,   dateLabel: 'AD 38',     chapter: 9,  panel: 2 },
  { id: 'cornelius',            year: 40,   dateLabel: 'AD 40',     chapter: 10, panel: 3 },
  { id: 'herod-dies',           year: 44,   dateLabel: 'AD 44',     chapter: 12, panel: 3 },
  { id: 'famine-relief',        year: 46,   dateLabel: 'AD 46',     chapter: 11, panel: 3 },
  { id: 'first-journey',        year: 47,   dateLabel: 'AD 47',     chapter: 13, panel: 4, journey: 'journey-1' },
  { id: 'jerusalem-council',    year: 49,   dateLabel: 'AD 49',     chapter: 15, panel: 4 },
  { id: 'second-journey',       year: 49,   dateLabel: 'AD 49',     chapter: 16, panel: 5, journey: 'journey-2' },
  { id: 'macedonian-vision',    year: 50,   dateLabel: 'AD 50',     chapter: 16, panel: 5 },
  { id: 'areopagus-sermon',     year: 50,   dateLabel: 'AD 50',     chapter: 17, panel: 5 },
  { id: 'corinth-gallio',       year: 51,   dateLabel: 'AD 51',     chapter: 18, panel: 5, duration: true },
  { id: 'third-journey',        year: 53,   dateLabel: 'AD 53',     chapter: 19, panel: 5, journey: 'journey-3', duration: true },
  { id: 'silversmiths-riot',    year: 56,   dateLabel: 'AD 56',     chapter: 19, panel: 5 },
  { id: 'paul-arrested',        year: 58,   dateLabel: 'AD 58',     chapter: 21, panel: 6 },
  { id: 'caesarea-prison',      year: 58,   dateLabel: 'AD 58–60',  chapter: 24, panel: 6, duration: true },
  { id: 'voyage-to-rome',       year: 60,   dateLabel: 'AD 60',     chapter: 27, panel: 6, journey: 'journey-4' },
  { id: 'house-arrest',         year: 61,   dateLabel: 'AD 60–62',  chapter: 28, panel: 6, duration: true },
];

// Vertical scale. Segment height between two events is proportional to the
// years elapsed, clamped so dense clusters stay readable and the long early
// gaps still feel longer.
const PX_PER_YEAR = 30;
const MIN_SEGMENT = 46;
const MAX_SEGMENT = 150;

export function TimelineView({
  open,
  onClose,
  activePanel,
  onPanelSelect,
  onJourneySelect,
  onOpenChapter,
}: Props) {
  const { t, fmt } = useT();

  // Close on Escape; lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Pre-compute the elapsed-time label and segment height for the gap
  // *before* each event (index 0 has no gap).
  const rows = useMemo(() => {
    const tv = t.timelineView;
    return EVENTS.map((e, i) => {
      if (i === 0) return { ...e, gapLabel: null as string | null, gapHeight: 0 };
      const diff = e.year - EVENTS[i - 1].year;
      const clamped = Math.min(MAX_SEGMENT, Math.max(MIN_SEGMENT, diff * PX_PER_YEAR));
      let gapLabel: string;
      if (diff <= 0) gapLabel = tv.later.sameYear;
      else if (diff === 1) gapLabel = tv.later.year;
      else gapLabel = fmt(tv.later.years, { n: diff });
      return { ...e, gapLabel, gapHeight: clamped };
    });
  }, [t, fmt]);

  if (!open) return null;

  const tv = t.timelineView;
  const eventsT = t.timeline.events as Record<string, { title: string; blurb: string }>;
  const durationsT = tv.durations as Record<string, string>;

  const handleJump = (e: TLEvent) => {
    onPanelSelect(e.panel);
    onOpenChapter(e.chapter);
    if (e.journey) onJourneySelect(e.journey);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={tv.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-dark/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-cream w-full md:max-w-2xl md:rounded-xl shadow-2xl flex flex-col max-h-screen md:max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-cream-warm/95 backdrop-blur border-b border-cream-dark px-5 md:px-7 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl md:text-2xl text-navy leading-tight">
              {tv.title}
            </h2>
            <p className="text-xs md:text-sm text-navy/70 italic mt-0.5">{tv.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={tv.close}
            className="shrink-0 w-9 h-9 rounded-full grid place-items-center text-navy/60 hover:text-navy hover:bg-cream-dark transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-5 md:px-7 py-5">
          {/* Prologue — the lead-in to Pentecost, counted in days. */}
          <div className="mb-6 rounded-lg border border-gold/40 bg-gold/5 px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-dark">
                {tv.prologue.heading}
              </span>
              <span className="text-[10px] text-navy/45 italic">{tv.prologue.scaleTag}</span>
            </div>
            <ol className="space-y-1.5 text-sm text-navy/80">
              <li className="flex items-baseline gap-2">
                <span className="text-gold-dark" aria-hidden="true">◆</span>
                <span><span className="font-semibold">{tv.prologue.resurrection}</span> — {tv.prologue.resurrectionNote}</span>
              </li>
              <li className="flex items-baseline gap-2 pl-1 text-navy/60 text-[13px]">
                <span aria-hidden="true">↓</span><span>{tv.prologue.appearances}</span>
              </li>
              <li className="flex items-baseline gap-2 pl-1 text-navy/60 text-[13px]">
                <span aria-hidden="true">↓</span><span>{tv.prologue.waiting}</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-gold-dark" aria-hidden="true">◆</span>
                <span className="font-semibold text-navy">{tv.prologue.pentecost}</span>
              </li>
            </ol>
          </div>

          {/* To-scale vertical timeline */}
          <div className="relative">
            {/* Axis line */}
            <div className="absolute top-1 bottom-1 left-[4.25rem] w-px bg-navy/15" aria-hidden="true" />

            <ol>
              {rows.map((e) => {
                const meta = eventsT[e.id];
                const title = meta?.title ?? e.id;
                const blurb = meta?.blurb ?? '';
                const durationLabel = e.duration ? durationsT[e.id] : undefined;
                const isActive = e.panel === activePanel;
                return (
                  <li key={e.id}>
                    {/* Gap with elapsed-time label */}
                    {e.gapLabel && (
                      <div className="relative" style={{ height: e.gapHeight }}>
                        <div className="absolute left-[4.25rem] -translate-x-1/2 top-1/2 -translate-y-1/2">
                          <span className="whitespace-nowrap rounded-full bg-cream px-2 py-0.5 text-[10px] font-medium text-navy/55 border border-cream-dark">
                            {e.gapLabel}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Event row */}
                    <div className="relative grid grid-cols-[4.25rem_1fr] items-start">
                      {/* Date (left of axis) */}
                      <div className="pr-3 pt-1.5 text-right text-[11px] font-semibold text-navy/55 tabular-nums">
                        {e.dateLabel}
                      </div>

                      {/* Card (right of axis), dot sits on the axis */}
                      <div className="relative pl-5 pb-1">
                        <span
                          className={`absolute left-0 top-3 -translate-x-1/2 rounded-full transition-all ${
                            isActive
                              ? 'w-3.5 h-3.5 bg-gold ring-4 ring-gold/25'
                              : 'w-3 h-3 bg-navy/70'
                          }`}
                          aria-hidden="true"
                        />
                        <button
                          onClick={() => handleJump(e)}
                          className={`w-full text-left rounded-lg border px-3 py-2 transition-colors group ${
                            isActive
                              ? 'border-gold/60 bg-gold/10'
                              : 'border-cream-dark bg-cream-warm/40 hover:border-gold/50 hover:bg-cream-warm'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-heading text-navy text-[15px] leading-snug group-hover:text-navy">
                              {title}
                            </span>
                            <span className="shrink-0 text-[10px] font-semibold text-gold-dark uppercase tracking-wide">
                              {t.scripture.chapterPrefix} {e.chapter}
                            </span>
                          </div>
                          {blurb && (
                            <p className="text-[12.5px] text-navy/65 leading-snug mt-0.5">{blurb}</p>
                          )}
                          {durationLabel && (
                            <span className="inline-flex items-center gap-1 mt-1.5 rounded-full bg-gold/15 border border-gold/40 px-2 py-0.5 text-[10.5px] font-semibold text-gold-dark">
                              <span aria-hidden="true">⏳</span>{durationLabel}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="mt-6 text-[11px] text-navy/45 italic leading-snug">
            {tv.scaleNote} · {tv.jumpHint}
          </p>
        </div>
      </div>
    </div>
  );
}
